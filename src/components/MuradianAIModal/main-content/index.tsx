"use client";

import { WelcomeHeader } from "./welcome-header";
import { ChatInput } from "./chat-input";
import { RefObject } from "react";

interface MainContentProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

export default function MainContent({ query, setQuery, inputRef }: MainContentProps) {
  return (
    <main className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-12 sm:px-20 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          <WelcomeHeader />
          <ChatInput query={query} setQuery={setQuery} inputRef={inputRef} />
        </div>
      </div>
    </main>
  );
}
