"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-8 mb-12">
      {messages
        .filter((m) => m.role !== "system")
        .map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col gap-2",
              message.role === "user" ? "items-end" : "items-start w-full",
            )}
          >
            <div
              className={cn(
                "leading-relaxed",
                message.role === "user"
                  ? "max-w-[80%] rounded-2xl p-4 text-sm bg-zinc-100 dark:bg-zinc-800 text-foreground shadow-sm rounded-tr-none"
                  : "w-full text-base text-foreground",
              )}
            >
              {/* Images Grid */}
              {message.images && message.images.length > 0 && (
                <div
                  className={cn(
                    "flex flex-wrap gap-2 mb-3",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative h-40 w-40 rounded-xl overflow-hidden border border-border shadow-sm"
                    >
                      <Image
                        src={img}
                        alt="attachment"
                        fill
                        sizes="160px"
                        className="object-cover cursor-zoom-in"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  "prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:rounded-xl",
                  message.role === "assistant" ? "text-base" : "text-sm",
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex justify-start">
          <div className="bg-card border border-border rounded-3xl rounded-tl-none p-6 shadow-sm">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
