import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

interface ComplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ClassificationResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;
    if (!token)
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );

    const payload = verifyToken(token);
    if (!payload)
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid token" }, { status: 401 }),
        request,
      );

    const { messages } = (await request.json()) as {
      messages?: ComplexityMessage[];
    };

    if (!messages || !Array.isArray(messages)) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Messages array required" },
          { status: 400 },
        ),
        request,
      );
    }

    // Call DeepSeek to classify the conversation complexity
    const apiKey = process.env.DEEPSEEK_API;
    if (!apiKey) {
      console.warn("DEEPSEEK_API not set, falling back to simple heuristic");
      const lastMessages = messages
        .slice(-5)
        .map((message) => message.content)
        .join(" ");
      const isHard =
        lastMessages.length > 500 ||
        /code|complex|algorithm|debug|math|solve/i.test(lastMessages);
      return withCorsHeaders(
        NextResponse.json({
          model: isHard ? "deepseek-v4-pro" : "deepseek-v4-flash",
          complexity: isHard ? "hard" : "simple",
        }),
        request,
      );
    }

    const classificationResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // Use faster model for classification
          messages: [
            {
              role: "system",
              content: `Analyze the following conversation history and decide if the most recent user request is "hard" or "simple". 
            
            Criteria for "hard":
            - Requires complex reasoning, math, or coding.
            - Involves multi-step logic.
            - Needs deep domain knowledge.
            - "v4-flash" might struggle with accuracy here.
            
            Criteria for "simple":
            - Basic greeting, chat, or general inquiry.
            - Simple translations or factual questions.
            - "v4-flash" can easily solve this.
            
            Respond ONLY with a JSON object: {"complexity": "hard" | "simple"}`,
            },
            ...messages
              .slice(-5)
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
          ],
          response_format: { type: "json_object" },
          max_tokens: 50,
        }),
      },
    );

    if (!classificationResponse.ok) {
      throw new Error("Failed to call classification API");
    }

    const result =
      (await classificationResponse.json()) as ClassificationResponse;
    const classification = JSON.parse(
      result.choices?.[0]?.message?.content || '{"complexity":"simple"}',
    ) as { complexity?: "hard" | "simple" };
    const isHard = classification.complexity === "hard";

    return withCorsHeaders(
      NextResponse.json({
        model: isHard ? "deepseek-v4-pro" : "deepseek-v4-flash",
        complexity: classification.complexity || "simple",
      }),
      request,
    );
  } catch (error) {
    console.error("Detect Complexity Error:", error);
    // Fallback to simple heuristic on error to avoid breaking the UX
    return withCorsHeaders(
      NextResponse.json({
        model: "deepseek-v4-flash",
        complexity: "simple",
        error: "AI classification failed, defaulted to simple",
      }),
      request,
    );
  }
}
