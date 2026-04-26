"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

interface ChatInputProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput = ({ query, setQuery, inputRef }: ChatInputProps) => {
  return (
    <div className="relative border border-border rounded-3xl bg-card shadow-sm focus-within:shadow-md focus-within:border-primary/30 transition-all">
      <Textarea
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Whatever you need, just ask Muradian AI!"
        className="w-full min-h-[220px] p-8 text-xl bg-transparent border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/50"
      />
      
      <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/30 rounded-b-3xl">
        <div className="flex items-center gap-5">
          <span className="text-sm text-muted-foreground font-medium tabular-nums">
            {query.length.toString().padStart(2, '0')}/10,000
          </span>
          <Button 
            size="icon" 
            className={cn(
              "h-12 w-12 rounded-xl transition-all shadow-sm",
              query.trim() 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            disabled={!query.trim()}
          >
            <HugeiconsIcon icon={SentIcon} size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};
