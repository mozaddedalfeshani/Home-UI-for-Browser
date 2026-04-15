"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AiChat01Icon,
  AiIdeaIcon,
  AiSettingIcon,
  ArrowLeft01Icon,
  BotIcon,
  Cancel01Icon,
  Key02Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type AIProvider,
  type AIBehaviorPreset,
  type AILanguagePreset,
  useAISidebarStore,
} from "@/store/aiSidebarStore";

const PROVIDERS: Array<{
  value: AIProvider;
  label: string;
  subtitle: string;
}> = [
  {
    value: "deepseek",
    label: "DeepSeek",
    subtitle: "api.deepseek.com",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    subtitle: "openrouter.ai",
  },
];

const LANGUAGE_OPTIONS: Array<{
  value: AILanguagePreset;
  label: string;
}> = [
  { value: "english", label: "English" },
  { value: "bangla", label: "Bangla" },
  { value: "auto", label: "Auto Detect" },
];

const BEHAVIOR_OPTIONS: Array<{
  value: AIBehaviorPreset;
  label: string;
}> = [
  { value: "balanced", label: "Balanced" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
];

const getSystemPrompt = (
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

const extractDeltaContent = (payload: unknown) => {
  const parsed = payload as {
    choices?: Array<{
      delta?: {
        content?: string;
        reasoning?: string;
      };
      message?: {
        content?: string;
      };
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

const getProviderErrorMessage = (payload: unknown, fallback: string) => {
  const parsed = payload as {
    error?: {
      message?: string;
      code?: number | string;
      metadata?: {
        raw?: string;
        provider_name?: string;
      };
    };
  };

  const rawMessage = parsed.error?.metadata?.raw?.trim();
  if (rawMessage) {
    return rawMessage;
  }

  const providerMessage = parsed.error?.message?.trim();
  if (providerMessage) {
    return providerMessage;
  }

  return fallback;
};

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

const getProviderConfig = (
  provider: AIProvider,
  apiKey: string,
  openRouterModel: string,
) => {
  if (provider === "openrouter") {
    return {
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://home-ui.local",
        "X-Title": "Home UI for Browser",
      },
      bodyBase: {
        model: openRouterModel || "openrouter/auto",
      },
    };
  }

  return {
    endpoint: "https://api.deepseek.com/chat/completions",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    bodyBase: {
      model: "deepseek-chat",
    },
  };
};

const AISidebar = ({ open, onClose }: AISidebarProps) => {
  const [draftMessage, setDraftMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const modelsPopoverRef = useRef<HTMLDivElement | null>(null);

  const {
    provider,
    apiKey,
    openRouterModel,
    rules,
    language,
    behavior,
    sendHistory,
    messages,
    isConfigured,
    setProvider,
    setApiKey,
    setOpenRouterModel,
    setRules,
    setLanguage,
    setBehavior,
    setSendHistory,
    completeSetup,
    addMessage,
    updateMessageContent,
    clearMessages,
  } = useAISidebarStore();

  const providerMeta = useMemo(
    () => PROVIDERS.find((item) => item.value === provider) ?? PROVIDERS[0],
    [provider],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  useEffect(() => {
    if (!isModelsOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelsPopoverRef.current &&
        !modelsPopoverRef.current.contains(event.target as Node)
      ) {
        setIsModelsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelsOpen]);

  useEffect(() => {
    if (
      !isModelsOpen ||
      provider !== "openrouter" ||
      availableModels.length > 0 ||
      isLoadingModels
    ) {
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      setModelsError(null);

      try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: apiKey.trim()
            ? {
                Authorization: `Bearer ${apiKey.trim()}`,
              }
            : undefined,
        });

        const payload = (await response.json()) as {
          data?: Array<{ id?: string }>;
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(
            getProviderErrorMessage(
              payload,
              "Unable to load OpenRouter models.",
            ),
          );
        }

        const modelIds = (payload.data ?? [])
          .map((item) => item.id?.trim())
          .filter((item): item is string => Boolean(item))
          .sort((first, second) => first.localeCompare(second));

        setAvailableModels(modelIds.length ? modelIds : ["openrouter/auto"]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load OpenRouter models.";
        setModelsError(message);
        toast.error(message);
      } finally {
        setIsLoadingModels(false);
      }
    };

    void fetchModels();
  }, [
    apiKey,
    availableModels.length,
    isLoadingModels,
    isModelsOpen,
    provider,
  ]);

  const handleSetupSubmit = () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter an API key to continue.");
      return;
    }

    setErrorMessage(null);
    completeSetup();
    setIsConfigMode(false);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage || isSubmitting) {
      return;
    }

    if (!apiKey.trim()) {
      setErrorMessage("Add your API key first.");
      setIsConfigMode(true);
      return;
    }

    const nextUserMessage = { role: "user" as const, content: trimmedMessage };
    addMessage(nextUserMessage);
    setDraftMessage("");
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const providerConfig = getProviderConfig(
        provider,
        apiKey.trim(),
        openRouterModel,
      );
      const systemPrompt = getSystemPrompt(rules, language, behavior);
      const payloadMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...(sendHistory
          ? [
              ...messages,
              { id: "pending", createdAt: Date.now(), ...nextUserMessage },
            ].map((message) => ({
              role: message.role,
              content: message.content,
            }))
          : [nextUserMessage]),
      ];

      const response = await fetch(providerConfig.endpoint, {
        method: "POST",
        headers: providerConfig.headers,
        body: JSON.stringify({
          ...providerConfig.bodyBase,
          stream: true,
          messages: payloadMessages,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: {
            message?: string;
            code?: number | string;
            metadata?: {
              raw?: string;
              provider_name?: string;
            };
          };
        };
        throw new Error(
          getProviderErrorMessage(
            payload,
            "Unable to reach the provider right now.",
          ),
        );
      }

      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
      });

      if (!response.body) {
        updateMessageContent(
          assistantMessageId,
          "No response stream returned.",
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let pendingChunk = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        pendingChunk += decoder.decode(value, { stream: true });
        const events = pendingChunk.split("\n\n");
        pendingChunk = events.pop() ?? "";

        for (const event of events) {
          const lines = event
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const jsonPayload = line.slice(5).trim();

            if (!jsonPayload || jsonPayload === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(jsonPayload) as unknown;
              const nextDelta = extractDeltaContent(parsed);

              if (!nextDelta) {
                continue;
              }

              accumulatedContent += nextDelta;
              updateMessageContent(assistantMessageId, accumulatedContent);
            } catch {
              // Ignore non-JSON event payloads in the stream.
            }
          }
        }
      }

      const trailingChunk = pendingChunk.trim();
      if (trailingChunk.startsWith("data:")) {
        const trailingPayload = trailingChunk.slice(5).trim();
        if (trailingPayload && trailingPayload !== "[DONE]") {
          try {
            const parsed = JSON.parse(trailingPayload) as unknown;
            const nextDelta = extractDeltaContent(parsed);
            if (nextDelta) {
              accumulatedContent += nextDelta;
            }
          } catch {
            // Ignore trailing payload parsing failures.
          }
        }
      }

      updateMessageContent(
        assistantMessageId,
        accumulatedContent || "No response content returned.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the message.";

      toast.error(message);
      addMessage({
        role: "assistant",
        content: `Error: ${message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const showSetup = !isConfigured || isConfigMode;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="h-full overflow-hidden rounded-r-3xl border-r border-border/60 bg-background/78 text-foreground shadow-2xl backdrop-blur-2xl transition-all duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-primary/15 bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={BotIcon}
                  size={18}
                  strokeWidth={2}
                  className="text-primary"
                />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight text-foreground/90">
                  AI Assistant
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {providerMeta.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!showSetup ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsConfigMode(true)}
                  className="h-8 w-8 rounded-full"
                  aria-label="Open AI settings"
                >
                  <HugeiconsIcon
                    icon={AiSettingIcon}
                    size={18}
                    strokeWidth={2}
                  />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
                aria-label="Close AI sidebar"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  strokeWidth={2}
                />
              </Button>
            </div>
          </div>

          {showSetup ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
              {isConfigured ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConfigMode(false)}
                  className="-ml-2 mb-4 h-8 w-fit gap-2 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={18}
                    strokeWidth={2}
                  />
                  Back to chat
                </Button>
              ) : null}

              <div className="mb-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-4">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <HugeiconsIcon
                    icon={AiIdeaIcon}
                    size={18}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-semibold">
                    Connect your AI provider
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose a provider, paste your API key, and continue to the chat
                  panel. Chat history is not sent by default unless you enable it
                  from the composer footer.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(event) =>
                      setProvider(event.target.value as AIProvider)
                    }
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-12 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none focus-visible:ring-[3px]"
                  >
                    {PROVIDERS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {providerMeta.subtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    API Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      placeholder={`Enter your ${providerMeta.label} API key`}
                      className="h-12 rounded-xl pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowApiKey((current) => !current)}
                      className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                      aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      <HugeiconsIcon
                        icon={Key02Icon}
                        size={18}
                        strokeWidth={2}
                      />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Rules
                    </label>
                    <Textarea
                      value={rules}
                      onChange={(event) =>
                        setRules(event.target.value)
                      }
                      placeholder="Write custom rules for the assistant..."
                      className="min-h-24 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(event) =>
                          setLanguage(event.target.value as AILanguagePreset)
                        }
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none focus-visible:ring-[3px]"
                      >
                        {LANGUAGE_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Behavior
                      </label>
                      <select
                        value={behavior}
                        onChange={(event) =>
                          setBehavior(event.target.value as AIBehaviorPreset)
                        }
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-foreground outline-none focus-visible:ring-[3px]"
                      >
                        {BEHAVIOR_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {errorMessage ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={handleSetupSubmit}
                  className="h-12 rounded-xl bg-primary/85 text-primary-foreground hover:bg-primary"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                {messages.length ? (
                  messages.map((message) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                          isUser
                            ? "ml-auto bg-card text-card-foreground"
                            : "bg-primary/15 text-foreground",
                        )}
                      >
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {isUser ? "You" : providerMeta.label}
                        </p>
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
                    <HugeiconsIcon
                      icon={AiChat01Icon}
                      size={42}
                      strokeWidth={1.8}
                      className="mb-3 text-primary/80"
                    />
                    <p className="text-base font-semibold text-foreground">
                      Start a conversation
                    </p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                      Send a prompt and the assistant will answer here. History is
                      only included in the API request when you enable the footer
                      toggle.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border/50 bg-background/65 p-4">
                {errorMessage ? (
                  <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="rounded-3xl border border-border/60 bg-card/55 p-3 shadow-sm">
                  <Textarea
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Say something..."
                    className="min-h-28 resize-none border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSendHistory(!sendHistory)}
                            className={cn(
                              "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                              sendHistory
                                ? "border-emerald-400/70 bg-emerald-500/90"
                                : "border-border/60 bg-muted/60",
                            )}
                            aria-pressed={sendHistory}
                            aria-label="Toggle sending chat history"
                          >
                            <span
                              className={cn(
                                "inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
                                sendHistory ? "translate-x-6" : "translate-x-1",
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {sendHistory
                            ? "Chat history will be sent"
                            : "Only the current message will be sent"}
                        </TooltipContent>
                      </Tooltip>

                      {provider === "openrouter" ? (
                        <div className="relative" ref={modelsPopoverRef}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsModelsOpen((current) => !current)}
                            className="h-9 rounded-full px-3 text-xs text-muted-foreground"
                          >
                            Models
                          </Button>

                          {isModelsOpen ? (
                            <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                              <div className="mb-2 px-2 py-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  OpenRouter Models
                                </p>
                                <p className="mt-1 truncate text-[11px] text-foreground/80">
                                  {openRouterModel}
                                </p>
                              </div>

                              <div className="max-h-64 space-y-1 overflow-y-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenRouterModel("openrouter/auto");
                                    setIsModelsOpen(false);
                                  }}
                                  className={cn(
                                    "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors",
                                    openRouterModel === "openrouter/auto"
                                      ? "bg-primary/12 text-primary"
                                      : "hover:bg-muted/70",
                                  )}
                                >
                                  openrouter/auto
                                </button>

                                {isLoadingModels ? (
                                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading models...
                                  </div>
                                ) : modelsError ? (
                                  <div className="px-3 py-3 text-sm text-destructive">
                                    {modelsError}
                                  </div>
                                ) : (
                                  availableModels
                                    .filter((model) => model !== "openrouter/auto")
                                    .map((model) => (
                                      <button
                                        key={model}
                                        type="button"
                                        onClick={() => {
                                          setOpenRouterModel(model);
                                          setIsModelsOpen(false);
                                        }}
                                        className={cn(
                                          "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors",
                                          openRouterModel === model
                                            ? "bg-primary/12 text-primary"
                                            : "hover:bg-muted/70",
                                        )}
                                      >
                                        {model}
                                      </button>
                                    ))
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearMessages}
                        className="h-9 rounded-full px-3 text-xs text-muted-foreground"
                      >
                        Clear chat
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={!draftMessage.trim() || isSubmitting}
                      className="h-10 rounded-full px-4"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <HugeiconsIcon
                          icon={SentIcon}
                          size={18}
                          strokeWidth={2}
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AISidebar;
