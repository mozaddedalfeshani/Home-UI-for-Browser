"use client";

import { SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AISidebarComposerProps {
  draftMessage: string;
  isSubmitting: boolean;
  sendHistory: boolean;
  provider: string;
  apiKey: string;
  openRouterModel: string;
  isModelsOpen: boolean;
  isLoadingModels: boolean;
  modelsError: string | null;
  availableModels: string[];
  errorMessage: string | null;
  isAgentMode: boolean;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  onToggleSendHistory: () => void;
  onToggleModels: () => void;
  onSelectModel: (model: string) => void;
  onClearChat: () => void;
  modelsPopoverRef: { current: HTMLDivElement | null };
}

export function AISidebarComposer({
  draftMessage,
  isSubmitting,
  sendHistory,
  provider,
  apiKey,
  openRouterModel,
  isModelsOpen,
  isLoadingModels,
  modelsError,
  availableModels,
  errorMessage,
  isAgentMode,
  onDraftChange,
  onSend,
  onToggleSendHistory,
  onToggleModels,
  onSelectModel,
  onClearChat,
  modelsPopoverRef,
}: AISidebarComposerProps) {
  const hasApiKey = apiKey.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={cn(
        "border-t bg-background/65 p-4",
        isAgentMode ? "border-indigo-500/20" : "border-border/50",
      )}>
      {errorMessage ? (
        <div className="mb-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {!hasApiKey ? (
        <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-700 dark:text-amber-400">
          <p className="font-medium">API Key Required</p>
          <p className="mt-1 text-xs">
            Please configure your API key in settings to use this agent.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-3xl border p-3 shadow-sm",
          isAgentMode
            ? "border-indigo-500/30 bg-indigo-500/5"
            : "border-border/60 bg-card/55",
        )}>
        <Textarea
          value={draftMessage}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasApiKey
              ? "Say something..."
              : "Configure API key to start chatting..."
          }
          disabled={!hasApiKey}
          className="h-28 resize-none overflow-y-auto border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleSendHistory}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    sendHistory
                      ? "border-emerald-400/70 bg-emerald-500/90"
                      : "border-border/60 bg-muted/60",
                  )}
                  aria-pressed={sendHistory}
                  aria-label="Toggle sending chat history">
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
                  onClick={onToggleModels}
                  className="h-9 rounded-full px-3 text-xs text-muted-foreground">
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
                        onClick={() => onSelectModel("openrouter/auto")}
                        className={cn(
                          "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          openRouterModel === "openrouter/auto"
                            ? "bg-primary/12 text-primary"
                            : "hover:bg-muted/70",
                        )}>
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
                              onClick={() => onSelectModel(model)}
                              className={cn(
                                "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors",
                                openRouterModel === model
                                  ? "bg-primary/12 text-primary"
                                  : "hover:bg-muted/70",
                              )}>
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
              onClick={onClearChat}
              className="h-9 rounded-full px-3 text-xs text-muted-foreground">
              Clear chat
            </Button>
          </div>

          <Button
            type="button"
            onClick={onSend}
            disabled={!hasApiKey || !draftMessage.trim() || isSubmitting}
            className="h-10 rounded-full px-4">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HugeiconsIcon icon={SentIcon} size={18} strokeWidth={2} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
