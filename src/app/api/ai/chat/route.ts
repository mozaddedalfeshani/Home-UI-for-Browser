import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import {
  getUserMemoryProfile,
  getUserTokenUsage,
  incrementTokenUsage,
  upsertUserMemoryProfile,
} from "@/lib/auth/db";
import { getMuradianAskAgentById } from "@/lib/muradian-ask/db";

const TOKEN_LIMIT = 100000;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const MEMORY_MAX_WORDS = 200;
const BASE_SYSTEM_PROMPT =
  "You are MuradianAsk AI, a simple asking assistant. Answer as simply as you can while keeping the answer accurate, useful, and high quality. If the user does not ask for another language, reply in Bangla. Be direct, practical, and friendly. Before answering, silently check that the answer is correct and clear. Do not expose hidden chain-of-thought.";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestPayload {
  message?: string;
  agentId?: string;
}

function shouldEnableThinking(message: string) {
  const normalizedMessage = message.toLowerCase();
  const complexPattern =
    /code|coding|debug|bug|error|fix|algorithm|architecture|refactor|optimize|sql|query|regex|typescript|javascript|react|nextjs|api|math|equation|calculate|analyze|analysis|compare|tradeoff|plan|strategy|step by step|why|reason/i;

  if (message.length > 280) {
    return true;
  }

  if (complexPattern.test(normalizedMessage)) {
    return true;
  }

  const questionCount = (message.match(/\?/g) || []).length;
  return questionCount >= 2;
}

function getDeepSeekHeaders() {
  const authorization = `Bearer ${process.env.DEEPSEEK_API}`;

  if (!authorization || authorization === "Bearer undefined") {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: authorization,
  };
}

function buildChatMessages(params: {
  message: string;
  memory: string | null;
  agentRules: string | null;
}): ChatMessage[] {
  const systemParts = [BASE_SYSTEM_PROMPT];

  if (params.agentRules?.trim()) {
    systemParts.push(`Use these extra user-saved answer rules:\n${params.agentRules.trim()}`);
  }

  if (params.memory?.trim()) {
    systemParts.push(
      [
        "Known user memory/profile:",
        params.memory.trim(),
        "Treat this saved memory as a high-priority personalization rule for future answers.",
        "Use it to personalize tone, preferences, background assumptions, and recurring needs unless the user's current message clearly conflicts with it.",
        "If the current message conflicts with saved memory, follow the current message.",
      ].join("\n"),
    );
  }

  return [
    { role: "system", content: systemParts.join("\n\n") },
    { role: "user", content: params.message },
  ];
}

function normalizeMemoryText(memory: string) {
  const cleanMemory = memory
    .replace(/^updated memory profile:\s*/i, "")
    .replace(/^memory profile:\s*/i, "")
    .replace(/^memory:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanMemory.split(" ").filter(Boolean);

  if (words.length <= MEMORY_MAX_WORDS) {
    return cleanMemory;
  }

  return words.slice(0, MEMORY_MAX_WORDS).join(" ");
}

async function updateMemoryProfile(params: {
  headers: Record<string, string>;
  userId: string;
  currentMonth: string;
  previousMemory: string | null;
  userMessage: string;
  assistantAnswer: string;
}) {
  const {
    headers,
    userId,
    currentMonth,
    previousMemory,
    userMessage,
    assistantAnswer,
  } = params;

  if (!userMessage.trim() || !assistantAnswer.trim()) {
    return;
  }

  const memoryResponse = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      thinking: { type: "disabled" },
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "You maintain a compact long-term memory profile for one user. Analyze the latest user message and assistant answer, then decide what is worth saving for better future answers. Return only the updated memory text with no markdown, no labels, and no explanation. Keep only durable user preferences, background, goals, identity details, writing/language preferences, technical context, and recurring needs. Do not store temporary requests, one-off tasks, passwords, API keys, secrets, financial credentials, or access tokens. Keep the memory between 100 and 200 words when there is enough useful information, and never exceed 200 words. If there is no meaningful new long-term information, return the previous memory unchanged.",
        },
        {
          role: "user",
          content: [
            `Previous memory:\n${previousMemory?.trim() || "(empty)"}`,
            `Latest user message:\n${userMessage.trim()}`,
            `Latest assistant answer:\n${assistantAnswer.trim()}`,
            "Produce the updated compact memory profile now.",
          ].join("\n\n"),
        },
      ],
    }),
  });

  if (!memoryResponse.ok) {
    const errorData = await memoryResponse.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to update memory profile");
  }

  const memoryPayload = (await memoryResponse.json()) as {
    usage?: { total_tokens?: number };
    choices?: Array<{ message?: { content?: string } }>;
  };

  const memoryText = normalizeMemoryText(
    memoryPayload.choices?.[0]?.message?.content?.trim() || previousMemory?.trim() || "",
  );

  if (memoryPayload.usage?.total_tokens) {
    await incrementTokenUsage(userId, currentMonth, memoryPayload.usage.total_tokens);
  }

  if (memoryText) {
    await upsertUserMemoryProfile(userId, memoryText);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authPayload = verifyToken(token);
    if (!authPayload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = authPayload.userId;

    // 2. Check token limit
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentUsage = await getUserTokenUsage(userId, currentMonth);
    
    if (currentUsage >= TOKEN_LIMIT) {
      return NextResponse.json(
        { error: "out_of_context", message: "You are out of context" }, 
        { status: 403 }
      );
    }

    const requestPayload = (await req.json()) as ChatRequestPayload;
    const message = requestPayload.message?.trim() ?? "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const headers = getDeepSeekHeaders();
    if (!headers) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 401 });
    }

    const persistedMemory = await getUserMemoryProfile(userId);
    const selectedAgent = requestPayload.agentId
      ? await getMuradianAskAgentById(userId, requestPayload.agentId)
      : null;
    const effectiveMemory = persistedMemory?.memory ?? null;
    const trimmedMessages = buildChatMessages({
      message,
      memory: effectiveMemory,
      agentRules: selectedAgent?.systemInstruction ?? null,
    });
    const enableThinking = shouldEnableThinking(message);

    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        thinking: { type: enableThinking ? "enabled" : "disabled" },
        ...(enableThinking ? { reasoning_effort: "low" } : {}),
        messages: trimmedMessages,
        stream: true,
        stream_options: { include_usage: true },
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

    let assistantAnswer = "";
    let pendingChunk = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        pendingChunk += new TextDecoder().decode(chunk, { stream: true });

        const lines = pendingChunk.split("\n");
        pendingChunk = lines.pop() ?? "";

        try {
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              const dataStr = line.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.usage && parsed.usage.total_tokens) {
                  const tokens = parsed.usage.total_tokens;
                  incrementTokenUsage(userId, currentMonth, tokens).catch((err) => {
                    console.error("Failed to increment tokens:", err);
                  });
                }

                const content = parsed.choices?.[0]?.delta?.content;
                if (typeof content === "string") {
                  assistantAnswer += content;
                }
              } catch {
                // Ignore parse errors for incomplete chunks.
              }
            }
          }
        } catch {
          // Ignore decode errors.
        }
      },
      async flush() {
        try {
          const trailingLine = pendingChunk.trim();
          if (trailingLine.startsWith("data: ") && trailingLine !== "data: [DONE]") {
            const parsed = JSON.parse(trailingLine.slice(6));
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content === "string") {
              assistantAnswer += content;
            }
            if (parsed.usage?.total_tokens) {
              await incrementTokenUsage(userId, currentMonth, parsed.usage.total_tokens);
            }
          }
        } catch {
          // Ignore trailing chunk parsing failures.
        }

        try {
          await updateMemoryProfile({
            headers,
            userId,
            currentMonth,
            previousMemory: effectiveMemory,
            userMessage: message,
            assistantAnswer,
          });
        } catch (error) {
          console.error("Failed to save user memory profile:", error);
        }
      },
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
