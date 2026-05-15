"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "../types";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  copiedId: string | null;
  onCopy: (msg: Message) => void;
}

export function ChatWindow({ messages, isLoading, copiedId, onCopy }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isTypingVisible =
    isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-2 scroll-smooth">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground/60">Ask me anything...</p>
        </div>
      ) : (
        <div className="space-y-4 pb-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} copiedId={copiedId} onCopy={onCopy} />
          ))}

          {isTypingVisible && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl rounded-tl-none bg-muted/40 px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
