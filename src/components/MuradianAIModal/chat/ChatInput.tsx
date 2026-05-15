"use client";

import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon, Attachment01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TokenUsageBar } from "./TokenUsageBar";
import { toast } from "sonner";
import type { TokenUsage } from "../types";

interface SlashCommand {
  cmd: string;
  label: string;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: "/clear", label: "Clear", description: "Remove all messages and reset context" },
  { cmd: "/compact", label: "Compact", description: "Compress history using existing summary" },
];

interface ChatInputProps {
  query: string;
  isLoading: boolean;
  hasMessages: boolean;
  open: boolean;
  tokenUsage: TokenUsage | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  agentPickerSlot: React.ReactNode;
  userRole: "free" | "lite" | "plus";
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
  userRole,
  onQueryChange,
  onSend,
  onClear,
}: ChatInputProps) {
  const prevOpenRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
    input.style.height = `${Math.min(input.scrollHeight, 80)}px`;
    input.style.overflowY = input.scrollHeight > 80 ? "auto" : "hidden";
  }, [query, open, inputRef]);

  const showCommands = query.startsWith("/") && !query.includes(" ");
  const filteredCommands = showCommands
    ? SLASH_COMMANDS.filter((c) => c.cmd.startsWith(query.toLowerCase()))
    : [];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const pickCommand = (cmd: string) => {
    onQueryChange(cmd);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (filteredCommands.length > 0) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        onQueryChange(filteredCommands[activeIndex].cmd);
        return;
      }
      if (e.key === "Escape") {
        onQueryChange("");
        return;
      }
    }
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (filteredCommands.length > 0 && query !== filteredCommands[activeIndex].cmd) {
      onQueryChange(filteredCommands[activeIndex].cmd);
      return;
    }
    onSend();
  };

  return (
    <div className="shrink-0 border-t border-border/20 p-1.5">
      {filteredCommands.length > 0 && (
        <div className="mb-1.5 overflow-hidden rounded-2xl border border-border/40 bg-background/95 shadow-lg backdrop-blur-xl">
          {filteredCommands.map((c, i) => (
            <button
              key={c.cmd}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pickCommand(c.cmd)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                i === activeIndex ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <span className="min-w-[4.5rem] font-mono text-xs font-semibold text-primary">
                {c.cmd}
              </span>
              <span className="text-xs text-muted-foreground">{c.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Unified bordered container */}
      <div className="rounded-2xl border border-black/20 bg-background/60 backdrop-blur-sm dark:border-white/20">
        {/* Textarea */}
        <Textarea
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="max-h-[80px] min-h-10 w-full resize-none rounded-t-2xl border-0 bg-transparent px-4 py-2.5 text-sm leading-5 shadow-none focus-visible:ring-0 dark:bg-transparent"
          disabled={isLoading}
        />

        {/* Bottom action bar */}
        <div className="flex items-center justify-between px-2 pb-2">
          {/* Left — attachment */}
          <div className="flex items-center gap-1">
            {userRole === "plus" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toast.info("File attachment coming soon")}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <HugeiconsIcon icon={Attachment01Icon} size={15} strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Right — clear + agent/model + send */}
          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                type="button"
                onClick={onClear}
                title="New chat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}

            {agentPickerSlot}

            <Button
              type="button"
              onClick={onSend}
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0 rounded-full shadow-md transition-all",
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
        </div>
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
