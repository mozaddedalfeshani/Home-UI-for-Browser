import type { AIBehaviorPreset, AILanguagePreset, AIProvider } from "@/store/aiSidebarStore";

export const getSystemPrompt = (
  rules: string,
  language: AILanguagePreset,
  behavior: AIBehaviorPreset,
) => {
  const ruleInstruction = rules.trim()
    ? `Additional rules: ${rules.trim()}`
    : "Be clear, helpful, and practical.";

  const languageInstruction =
    language === "bangla"
      ? "Respond in Bangla."
      : language === "auto"
        ? "Match the user's language when possible."
        : "Respond in English.";

  const behaviorInstruction =
    behavior === "friendly"
      ? "Use a warm, friendly tone."
      : behavior === "professional"
        ? "Use a professional, concise tone."
        : "Use a balanced and approachable tone.";

  return `${ruleInstruction} ${languageInstruction} ${behaviorInstruction}`;
};

export const getTitlePrompt = (rules: string, language: AILanguagePreset) => {
  const languageInstruction =
    language === "bangla"
      ? "Return the title in Bangla."
      : language === "auto"
        ? "Return the title in the same language as the assistant message."
        : "Return the title in English.";

  const rulesInstruction = rules.trim()
    ? `Additional user rules to respect when naming: ${rules.trim()}`
    : "";

  return [
    "Generate one concise sticky-note title for the provided assistant message.",
    "Return only the title text.",
    "Do not use quotation marks.",
    "Do not use markdown.",
    "Do not add prefixes like Title:.",
    "Keep it short and note-friendly.",
    languageInstruction,
    rulesInstruction,
  ]
    .filter(Boolean)
    .join(" ");
};

export const getProviderConfig = (
  provider: AIProvider,
  apiKey: string,
  openRouterModel: string,
): {
  endpoint: string;
  headers: Record<string, string>;
  bodyBase: { model: string };
} => {
  if (provider === "openrouter") {
    return {
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://home-ui.local",
        "X-Title": "Home UI for Browser",
      },
      bodyBase: { model: openRouterModel || "openrouter/auto" },
    };
  }

  return {
    endpoint: "https://api.deepseek.com/chat/completions",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    bodyBase: { model: "deepseek-chat" },
  };
};

export const extractDeltaContent = (payload: unknown) => {
  const parsed = payload as {
    choices?: Array<{
      delta?: { content?: string; reasoning?: string };
      message?: { content?: string };
    }>;
  };

  const choice = parsed.choices?.[0];
  return (
    choice?.delta?.content ??
    choice?.delta?.reasoning ??
    choice?.message?.content ??
    ""
  );
};

export const extractMessageContent = (payload: unknown) => {
  const parsed = payload as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return parsed.choices?.[0]?.message?.content?.trim() ?? "";
};

export const getProviderErrorMessage = (payload: unknown, fallback: string) => {
  const parsed = payload as {
    error?: {
      message?: string;
      code?: number | string;
      metadata?: { raw?: string; provider_name?: string };
    };
  };

  const rawMessage = parsed.error?.metadata?.raw?.trim();
  if (rawMessage) return rawMessage;

  const providerMessage = parsed.error?.message?.trim();
  if (providerMessage) return providerMessage;

  return fallback;
};
