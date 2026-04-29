import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserTokenUsage, incrementTokenUsage } from "@/lib/auth/db";

const TOKEN_LIMIT = 100000;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = payload.userId;

    // 2. Check token limit
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentUsage = await getUserTokenUsage(userId, currentMonth);
    
    if (currentUsage >= TOKEN_LIMIT) {
      return NextResponse.json(
        { error: "out_of_context", message: "You are out of context" }, 
        { status: 403 }
      );
    }

    const { messages, provider, apiKey, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // Determine endpoint and headers based on provider
    let endpoint = "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (provider === "openrouter") {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey || process.env.OPENROUTER_API_KEY}`;
      headers["HTTP-Referer"] = "https://home-ui.local";
      headers["X-Title"] = "MuradianAsk AI";
    } else {
      endpoint = "https://api.deepseek.com/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey || process.env.DEEPSEEK_API}`;
    }

    if (!headers["Authorization"] || headers["Authorization"] === "Bearer undefined") {
      return NextResponse.json({ error: "API Key is missing" }, { status: 401 });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model || (provider === "openrouter" ? "openrouter/auto" : "deepseek-chat"),
        messages,
        stream: true,
        stream_options: { include_usage: true } // Request usage stats in final chunk
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "AI Service Error" },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: "Empty response body" }, { status: 500 });
    }

    // 3. Intercept stream to extract usage stats
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk); // Pass chunk to client immediately
        
        try {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              const dataStr = line.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                // Extract usage stats from the chunk
                if (parsed.usage && parsed.usage.total_tokens) {
                  const tokens = parsed.usage.total_tokens;
                  // Fire and forget increment
                  incrementTokenUsage(userId, currentMonth, tokens).catch(err => {
                    console.error("Failed to increment tokens:", err);
                  });
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        } catch {
          // Ignore decode errors
        }
      }
    });

    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
