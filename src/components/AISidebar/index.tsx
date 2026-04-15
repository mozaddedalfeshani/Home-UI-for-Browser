"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronLeft,
  History,
  KeyRound,
  Loader2,
  PanelLeftClose,
  SendHorizonal,
  Settings2,
  Sparkles,
} from "lucide-react";
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

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

const getProviderConfig = (provider: AIProvider, apiKey: string) => {
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
        model: "openrouter/auto",
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
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    provider,
    apiKey,
    rules,
    language,
    behavior,
    sendHistory,
    messages,
    isConfigured,
    setProvider,
    setApiKey,
    setRules,
    setLanguage,
    setBehavior,
    setSendHistory,
    completeSetup,
    addMessage,
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
      const providerConfig = getProviderConfig(provider, apiKey.trim());
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
          messages: payloadMessages,
        }),
      });

      const payload = (await response.json()) as {
        error?: { message?: string };
        choices?: Array<{ message?: { content?: string } }>;
      };

      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "Unable to reach the provider right now.",
        );
      }

      const assistantMessage =
        payload.choices?.[0]?.message?.content?.trim() ||
        "No response content returned.";

      addMessage({
        role: "assistant",
        content: assistantMessage,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the message.";

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
                <Bot className="h-4 w-4 text-primary" />
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
                  <Settings2 className="h-4 w-4" />
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
                <PanelLeftClose className="h-4 w-4" />
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
                  <ChevronLeft className="h-4 w-4" />
                  Back to chat
                </Button>
              ) : null}

              <div className="mb-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-4">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
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
                      <KeyRound className="h-4 w-4" />
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
                    <Bot className="mb-3 h-10 w-10 text-primary/80" />
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSendHistory(!sendHistory)}
                            className={cn(
                              "h-9 w-9 rounded-full",
                              sendHistory
                                ? "bg-primary/15 text-primary hover:bg-primary/20"
                                : "text-muted-foreground hover:bg-muted",
                            )}
                            aria-pressed={sendHistory}
                            aria-label="Toggle sending chat history"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {sendHistory
                            ? "Chat history will be sent"
                            : "Only the current message will be sent"}
                        </TooltipContent>
                      </Tooltip>

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
                        <SendHorizonal className="h-4 w-4" />
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
