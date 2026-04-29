"use client";

import { RefObject } from "react";
import { Message } from "@/store/muradianAiStore";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeHeader } from "./welcome-header";

interface MainContentProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messages: Message[];
  isLoading: boolean;
  onSend: () => void;
  isOutOfContext?: boolean;
  onSaveHistory?: () => void;
}

export default function MainContent({ 
  query, 
  setQuery, 
  inputRef, 
  messages, 
  isLoading, 
  onSend,
  isOutOfContext,
  onSaveHistory
}: MainContentProps) {
  const isChatActive = messages.length > 0;

  return (
    <main className="flex-1 relative flex flex-col bg-background h-full overflow-hidden">
      {/* Top gradient to protect the Close badge and provide a smooth scroll-fade effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/80 to-transparent z-40 pointer-events-none" />

      <div className="flex h-full min-h-0 flex-col px-8 pb-8 pt-16">
        <div className="mx-auto flex h-full w-full min-h-0 flex-col gap-8 relative z-10">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-12">
              {!isChatActive ? <WelcomeHeader /> : null}

              <ChatMessages messages={messages} isLoading={isLoading} />

              {isOutOfContext && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 animate-in fade-in slide-in-from-bottom-4">
                  <p className="mb-3 text-center text-sm font-medium text-destructive">
                    You have exhausted your monthly token limit (100,000).
                  </p>
                  <button
                    onClick={onSaveHistory}
                    className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
                  >
                    Push AI chat history to DB
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 pb-2">
            <ChatInput
              query={query}
              setQuery={setQuery}
              inputRef={inputRef}
              onSend={onSend}
              isLoading={isLoading}
              isCompact={false}
            />
          </div>
        </div>
      </div>

    </main>
  );
}
