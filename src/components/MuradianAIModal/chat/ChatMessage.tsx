"use client";

import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { Message } from "../types";

interface ChatMessageProps {
  msg: Message;
  copiedId: string | null;
  onCopy: (msg: Message) => void;
}

export function ChatMessage({ msg, copiedId, onCopy }: ChatMessageProps) {
  if (msg.role === "user") {
    return (
      <div className="flex flex-col gap-1 items-end">
        <div className="max-w-[82%] rounded-2xl rounded-tr-none bg-zinc-100 px-4 py-2.5 text-sm dark:bg-zinc-800">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-1 items-start">
      <div className="w-full">
        <div
          className={cn(
            "prose dark:prose-invert max-w-none text-sm leading-relaxed",
            "prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-pre:rounded-xl prose-pre:bg-muted/50",
            !msg.content && "text-muted-foreground italic",
          )}
        >
          {msg.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          ) : (
            <span>Thinking...</span>
          )}
        </div>
        {msg.content && (
          <button
            type="button"
            onClick={() => onCopy(msg)}
            className="mt-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-foreground"
          >
            {copiedId === msg.id ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copiedId === msg.id ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
