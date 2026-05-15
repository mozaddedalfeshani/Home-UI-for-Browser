import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import {
  getUserMemoryProfile,
  incrementTokenUsage,
  incrementWindowTokenUsage,
  getWindowTokenUsage,
  upsertUserMemoryProfile,
} from "@/lib/auth/db";
import { getMuradianAskAgentForUse } from "@/lib/muradian-ask/db";

const WINDOW_TOKEN_LIMIT = 5000;
const WINDOW_HOURS = 10;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const MEMORY_MAX_WORDS = 200;
const BASE_SYSTEM_PROMPT =
  "You are MuradianAsk AI, a simple asking assistant. Answer as simply as you can while keeping the answer accurate, useful, and high quality. Be direct, practical, and friendly. Before answering, silently check that the answer is correct and clear. Do not expose hidden chain-of-thought.";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestPayload {
  message?: string;
  history?: ChatMessage[];
  historySummary?: string;
  newlyEvicted?: ChatMessage[];
  agentId?: string;
  uiLanguage?: "en" | "bn";
  userName?: string;
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
  history?: ChatMessage[];
  historySummary?: string;
  memory: string | null;
  agentRules: string | null;
  uiLanguage: "en" | "bn";
  userName: string | null;
}): ChatMessage[] {
  const languageInstruction =
    params.uiLanguage === "bn"
      ? "If the user does not ask for another language, reply in Bangla."
      : "If the user does not ask for another language, reply in English.";
  const systemParts = [BASE_SYSTEM_PROMPT, languageInstruction];

  if (params.userName?.trim()) {
    systemParts.push(
      `The current user's name is ${params.userName.trim()}. Use it only when it naturally improves the answer.`,
    );
  }

  if (params.agentRules?.trim()) {
    systemParts.push(
      `Use these extra user-saved answer rules:\n${params.agentRules.trim()}`,
    );
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

  if (params.historySummary?.trim()) {
    systemParts.push(
      `Earlier conversation summary (for context only):\n${params.historySummary.trim()}`,
    );
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemParts.join("\n\n") },
  ];

  if (params.history?.length) {
    for (const msg of params.history) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({ role: "user", content: params.message });

  return messages;
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
            "You maintain a compact long-term memory profile for one user. Analyze the latest user message and assistant answer, then decide what is worth saving for better future answers. Return only the updated memory text with no markdown, no labels, and no explanation. Keep only durable user preferences, background, goals, identity details, writing/language preferences, technical context, and recurring needs. Do not store temporary requests, one-off tasks, passwords, API keys, secrets, financial credentials, or access tokens. Keep the memory between 100 and 200 words when there is enough useful information, and never exceed 200 words. If there is no meaningful new long-term information, return the previous memory unchanged. Make sure conversation history does not leak into the memory. The memory should be a clean, compact, and high-value summary of what you know about the user for better future answers.",
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
    throw new Error(
      errorData.error?.message || "Failed to update memory profile",
    );
  }

  const memoryPayload = (await memoryResponse.json()) as {
    usage?: { total_tokens?: number };
    choices?: Array<{ message?: { content?: string } }>;
  };

  const memoryText = normalizeMemoryText(
    memoryPayload.choices?.[0]?.message?.content?.trim() ||
      previousMemory?.trim() ||
      "",
  );

  if (memoryPayload.usage?.total_tokens) {
    await incrementTokenUsage(
      userId,
      currentMonth,
      memoryPayload.usage.total_tokens,
    );
  }

  if (memoryText) {
    await upsertUserMemoryProfile(userId, memoryText);
  }
}

async function generateRollingSummary(params: {
  headers: Record<string, string>;
  userId: string;
  currentMonth: string;
  newlyEvicted: ChatMessage[];
  existingSummary: string;
}): Promise<string> {
  const { headers, userId, currentMonth, newlyEvicted, existingSummary } = params;

  const historyText = newlyEvicted
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const userContent = existingSummary.trim()
    ? `Previous summary:\n${existingSummary.trim()}\n\nNew messages to incorporate:\n${historyText}`
    : historyText;

  const res = await fetch(DEEPSEEK_ENDPOINT, {
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
            "Summarize this conversation history in under 120 words. Preserve key topics, decisions, context, and important details. Be concise and factual. No markdown. No labels.",
        },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) return existingSummary;

  const data = (await res.json()) as {
    usage?: { total_tokens?: number };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (data.usage?.total_tokens) {
    await incrementTokenUsage(userId, currentMonth, data.usage.total_tokens).catch(() => {});
  }

  return data.choices?.[0]?.message?.content?.trim() ?? existingSummary;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authPayload = verifyToken(token);
    if (!authPayload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = authPayload.userId;

    // 2. Check 10-hour window token limit
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM (kept for history)
    const windowUsage = await getWindowTokenUsage(userId);
    const currentWindowTokens = windowUsage.tokensUsed;
    const windowStart = windowUsage.windowStart;

    if (currentWindowTokens >= WINDOW_TOKEN_LIMIT) {
      const resetAt = new Date(windowStart.getTime() + WINDOW_HOURS * 60 * 60 * 1000);
      return NextResponse.json(
        {
          error: "out_of_context",
          message: "Token limit reached",
          resetAt: resetAt.toISOString(),
          tokensUsed: currentWindowTokens,
          tokenLimit: WINDOW_TOKEN_LIMIT,
        },
        { status: 403 },
      );
    }

    const requestPayload = (await req.json()) as ChatRequestPayload;
    const message = requestPayload.message?.trim() ?? "";
    const uiLanguage = requestPayload.uiLanguage === "bn" ? "bn" : "en";
    const userName = requestPayload.userName?.trim().slice(0, 80) ?? null;
    const history = requestPayload.history ?? [];
    const historySummary = requestPayload.historySummary?.trim() ?? null;
    const newlyEvicted = requestPayload.newlyEvicted ?? [];
    const existingSummary = requestPayload.historySummary?.trim() ?? "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const headers = getDeepSeekHeaders();
    if (!headers) {
      return NextResponse.json(
        { error: "API Key is missing" },
        { status: 401 },
      );
    }

    const isAgentMode = Boolean(requestPayload.agentId?.trim());
    const selectedAgent = requestPayload.agentId
      ? await getMuradianAskAgentForUse(userId, requestPayload.agentId)
      : null;
    const persistedMemory = isAgentMode
      ? null
      : await getUserMemoryProfile(userId);
    const effectiveMemory = isAgentMode
      ? null
      : (persistedMemory?.memory ?? null);
    const trimmedMessages = buildChatMessages({
      message,
      history,
      historySummary: historySummary ?? undefined,
      memory: effectiveMemory,
      agentRules: selectedAgent?.systemInstruction ?? null,
      uiLanguage,
      userName,
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
        { status: response.status },
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "Empty response body" },
        { status: 500 },
      );
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
                  Promise.allSettled([
                    incrementTokenUsage(userId, currentMonth, tokens),
                    incrementWindowTokenUsage(userId, tokens),
                  ]).catch((err) => console.error("Failed to increment tokens:", err));
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
      async flush(controller) {
        let trailingTokens = 0;
        try {
          const trailingLine = pendingChunk.trim();
          if (
            trailingLine.startsWith("data: ") &&
            trailingLine !== "data: [DONE]"
          ) {
            const parsed = JSON.parse(trailingLine.slice(6));
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content === "string") {
              assistantAnswer += content;
            }
            if (parsed.usage?.total_tokens) {
              trailingTokens = parsed.usage.total_tokens;
              await Promise.allSettled([
                incrementTokenUsage(userId, currentMonth, trailingTokens),
                incrementWindowTokenUsage(userId, trailingTokens),
              ]);
            }
          }
        } catch {
          // Ignore trailing chunk parsing failures.
        }

        // Run memory update and summary generation in parallel (both non-critical)
        let updatedWindowTokens = currentWindowTokens;

        await Promise.allSettled([
          isAgentMode
            ? Promise.resolve()
            : updateMemoryProfile({
                headers,
                userId,
                currentMonth,
                previousMemory: effectiveMemory,
                userMessage: message,
                assistantAnswer,
              }).catch((err) => console.error("Failed to save user memory profile:", err)),

          (async () => {
            if (!newlyEvicted.length) return;
            try {
              const updatedSummary = await generateRollingSummary({
                headers,
                userId,
                currentMonth,
                newlyEvicted,
                existingSummary,
              });
              const evt = `data: ${JSON.stringify({ t: "s", v: updatedSummary })}\n\n`;
              controller.enqueue(new TextEncoder().encode(evt));
            } catch (err) {
              console.error("Failed to generate rolling summary:", err);
            }
          })(),

          // Fetch updated window usage to return to client
          (async () => {
            try {
              const latest = await getWindowTokenUsage(userId);
              updatedWindowTokens = latest.tokensUsed;
              const resetAt = new Date(
                latest.windowStart.getTime() + WINDOW_HOURS * 60 * 60 * 1000,
              );
              const usageEvt = `data: ${JSON.stringify({
                t: "usage",
                tokensUsed: updatedWindowTokens,
                tokenLimit: WINDOW_TOKEN_LIMIT,
                resetAt: resetAt.toISOString(),
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(usageEvt));
            } catch {
              // non-critical
            }
          })(),
        ]);
      },
    });

    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
