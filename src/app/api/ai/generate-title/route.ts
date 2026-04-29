import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

interface TitleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface TitleResponse {
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
      messages?: TitleMessage[];
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

    const apiKey = process.env.DEEPSEEK_API;
    if (!apiKey) {
      return withCorsHeaders(
        NextResponse.json({ title: "Chat Session" }),
        request,
      );
    }

    const titleResponse = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // Fast model for generation
          messages: [
            {
              role: "system",
              content:
                "You are a title generator. Generate a short, concise, and descriptive title (2 to 5 words maximum) for the following conversation. Do not use quotes or punctuation. Respond ONLY with the title string.",
            },
            // Send the user/assistant messages for context
            ...messages
              .filter((message) => message.role !== "system")
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
          ],
          max_tokens: 15,
          temperature: 0.7,
        }),
      },
    );

    if (!titleResponse.ok) {
      throw new Error("Failed to call generation API");
    }

    const result = (await titleResponse.json()) as TitleResponse;
    const generatedTitle =
      result.choices?.[0]?.message?.content?.trim() || "Chat Session";

    return withCorsHeaders(
      NextResponse.json({ title: generatedTitle }),
      request,
    );
  } catch (error) {
    console.error("Generate Title Error:", error);
    return withCorsHeaders(
      NextResponse.json({ title: "Chat Session" }),
      request,
    );
  }
}
