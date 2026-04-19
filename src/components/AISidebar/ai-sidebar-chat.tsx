"use client";

import { forwardRef } from "react";
import { AiChat01Icon, MoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIChatMessage } from "@/store/aiSidebarStore";

interface AISidebarChatProps {
  messages: AIChatMessage[];
  providerLabel: string;
  savingMessageId: string | null;
  copyingMessageId: string | null;
  onCopyMessage: (id: string, content: string) => void;
  onSaveMessageToNote: (id: string, content: string) => void;
}

export const AISidebarChat = forwardRef<HTMLDivElement, AISidebarChatProps>(
  function AISidebarChat(
    { messages, providerLabel, savingMessageId, copyingMessageId, onCopyMessage, onSaveMessageToNote },
    ref,
  ) {
    return (
      <div ref={ref} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length ? (
          messages.map((message) => {
            const isUser = message.role === "user";
            const isSavingThisMessage = savingMessageId === message.id;
            const isCopyingThisMessage = copyingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                  isUser ? "ml-auto bg-card text-card-foreground" : "bg-primary/15 text-foreground",
                )}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isUser ? "You" : providerLabel}
                </p>
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <div className="ai-markdown break-words text-sm leading-6">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                            {children}
                          </a>
                        ),
                        code: ({ children, className }) => {
                          const isBlock = Boolean(className);
                          if (isBlock) {
                            return (
                              <code className="block overflow-x-auto rounded-xl bg-background/70 px-3 py-2 font-mono text-xs text-foreground">
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className="rounded bg-background/70 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="mb-3 overflow-x-auto rounded-xl bg-background/70 p-3 last:mb-0">{children}</pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 italic text-muted-foreground last:mb-0">
                            {children}
                          </blockquote>
                        ),
                      }}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                {!isUser ? (
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onCopyMessage(message.id, message.content)}
                      disabled={isCopyingThisMessage || !message.content.trim()}
                      className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-background/60 hover:text-foreground">
                      {isCopyingThisMessage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSaveMessageToNote(message.id, message.content)}
                      disabled={isSavingThisMessage || !message.content.trim()}
                      className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-background/60 hover:text-foreground">
                      {isSavingThisMessage ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={MoveIcon} size={16} strokeWidth={2} />
                      )}
                      <span>Save to note</span>
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
            <HugeiconsIcon icon={AiChat01Icon} size={42} strokeWidth={1.8} className="mb-3 text-primary/80" />
            <p className="text-base font-semibold text-foreground">Start a conversation</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
              Send a prompt and the assistant will answer here. History is only included in the API request when you enable the footer toggle.
            </p>
          </div>
        )}
      </div>
    );
  },
);
