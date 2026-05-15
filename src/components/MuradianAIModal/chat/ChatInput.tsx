"use client";

import { type KeyboardEvent, type RefObject, useEffect, useRef } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TokenUsageBar } from "./TokenUsageBar";
import type { TokenUsage } from "../types";

interface ChatInputProps {
  query: string;
  isLoading: boolean;
  hasMessages: boolean;
  open: boolean;
  tokenUsage: TokenUsage | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  agentPickerSlot: React.ReactNode;
  onQueryChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
}

export function ChatInput({
  query,
  isLoading,
  hasMessages,
  open,
  tokenUsage,
  inputRef,
  agentPickerSlot,
  onQueryChange,
  onSend,
  onClear,
}: ChatInputProps) {
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
    prevOpenRef.current = open;
  }, [open, inputRef]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "40px";
    input.style.height = `${Math.min(input.scrollHeight, 76)}px`;
    input.style.overflowY = input.scrollHeight > 76 ? "auto" : "hidden";
  }, [query, open, inputRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    onSend();
  };

  return (
    <div className="shrink-0 border-t border-border/20 p-1.5">
      <div className="flex items-center gap-1.5">
        <Textarea
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="max-h-[76px] min-h-10 flex-1 resize-none rounded-[18px] border-0 bg-transparent px-4 py-2.5 text-sm leading-5 shadow-none focus-visible:ring-0 dark:bg-transparent"
          disabled={isLoading}
        />

        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            title="New chat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        {agentPickerSlot}

        <Button
          type="button"
          onClick={onSend}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-full shadow-md transition-all",
            query.trim() && !isLoading
              ? "bg-indigo-500 text-white hover:bg-indigo-600"
              : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
          )}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HugeiconsIcon icon={SentIcon} size={16} />
          )}
        </Button>
      </div>

      {tokenUsage ? (
        <TokenUsageBar usage={tokenUsage} />
      ) : (
        <p className="mt-1 text-center text-[10px] text-muted-foreground/50">
          AI-generated content may not be accurate.
        </p>
      )}
    </div>
  );
}
