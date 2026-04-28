"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Mic01Icon, 
  SentIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefObject, KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";

interface ChatInputProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSend: () => void;
  isLoading: boolean;
  isCompact?: boolean;
}

export const ChatInput = ({ 
  query, 
  setQuery, 
  inputRef, 
  onSend, 
  isLoading,
  isCompact,
}: ChatInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!isCompact) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="relative flex w-full items-center gap-3 rounded-[2rem] border border-border/30 bg-transparent px-4 py-3 shadow-none sm:px-5">
          <Textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
            className="h-10 min-h-0 flex-1 resize-none rounded-none border-0 !bg-transparent dark:!bg-transparent px-0 py-0 text-base leading-10 shadow-none !shadow-none placeholder:text-zinc-500 focus-visible:ring-0 dark:placeholder:text-zinc-500"
            rows={1}
            disabled={isLoading}
          />

          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <HugeiconsIcon icon={Mic01Icon} size={22} />
          </button>

          <Button
            onClick={onSend}
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full shadow-md transition-all",
              query.trim() && !isLoading
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
            )}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <HugeiconsIcon icon={SentIcon} size={20} />
            )}
          </Button>
        </div>

        <p className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-600">
          AI-generated content may not be accurate.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className={cn(
        "relative flex w-full items-center rounded-full min-h-[56px] border border-border/30 bg-transparent px-4 py-2 transition-all"
      )}>
        <Textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
          className="h-10 min-h-0 flex-1 resize-none rounded-none border-0 !bg-transparent dark:!bg-transparent px-0 py-0 text-base leading-10 shadow-none !shadow-none placeholder:text-zinc-500 focus-visible:ring-0 dark:placeholder:text-zinc-500"
          rows={1}
          disabled={isLoading}
        />

        <div className="ml-2 flex shrink-0 items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <HugeiconsIcon icon={Mic01Icon} size={22} />
          </button>

          <Button
            onClick={onSend}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-md transition-all",
              query.trim() && !isLoading
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
            )}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <HugeiconsIcon icon={SentIcon} size={20} />
            )}
          </Button>
        </div>
      </div>

      <p className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-600">
        AI-generated content may not be accurate.
      </p>
    </div>
  );
};
