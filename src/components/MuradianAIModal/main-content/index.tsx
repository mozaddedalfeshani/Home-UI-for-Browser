"use client";

import { RefObject } from "react";
import { Message, useMuradianAiStore } from "@/store/muradianAiStore";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeHeader } from "./welcome-header";
import { AgentManagement } from "./agent-management";
import { SettingsPanel } from "./settings-panel";

interface MainContentProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messages: Message[];
  isLoading: boolean;
  onSend: () => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  isAutoModel: boolean;
  setIsAutoModel: (v: boolean) => void;
  selectedImages: string[];
  setSelectedImages: (v: string[]) => void;
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
  selectedModel,
  setSelectedModel,
  isAutoModel,
  setIsAutoModel,
  selectedImages,
  setSelectedImages,
  isOutOfContext,
  onSaveHistory
}: MainContentProps) {
  const { activeView } = useMuradianAiStore();
  const isChatActive = messages.length > 0;

  if (activeView === "agents") {
    return (
      <main className="flex-1 relative flex flex-col bg-background h-full overflow-hidden">
        <AgentManagement />
      </main>
    );
  }

  if (activeView === "settings") {
    return (
      <main className="flex-1 relative flex flex-col bg-background h-full overflow-hidden">
        <SettingsPanel />
      </main>
    );
  }

  return (
    <main className="flex-1 relative flex flex-col bg-background h-full overflow-hidden">
      {/* Top gradient to protect the Close badge and provide a smooth scroll-fade effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/80 to-transparent z-40 pointer-events-none" />

      <div className="flex-1 overflow-y-auto p-8 pb-40 pt-16">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          {!isChatActive && <WelcomeHeader />}
          
          <ChatMessages messages={messages} isLoading={isLoading} />
          
          {isOutOfContext && (
            <div className="flex flex-col items-center justify-center p-6 mt-4 border border-destructive/20 bg-destructive/5 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
              <p className="text-sm font-medium text-destructive mb-3 text-center">
                You have exhausted your monthly token limit (100,000). 
              </p>
              <button 
                onClick={onSaveHistory}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-full text-sm font-medium shadow-sm hover:bg-destructive/90 transition-colors"
              >
                Push AI chat history to DB
              </button>
            </div>
          )}

          {!isChatActive && (
            <div className="max-w-3xl mx-auto">
              <ChatInput 
                query={query} 
                setQuery={setQuery} 
                inputRef={inputRef} 
                onSend={onSend}
                isLoading={isLoading}
                isCompact={false}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                isAutoModel={isAutoModel}
                setIsAutoModel={setIsAutoModel}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
            </div>
          )}
        </div>
      </div>

      {isChatActive && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-12 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <ChatInput 
              query={query} 
              setQuery={setQuery} 
              inputRef={inputRef} 
              onSend={onSend}
              isLoading={isLoading}
              isCompact={true}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              isAutoModel={isAutoModel}
              setIsAutoModel={setIsAutoModel}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
            />
          </div>
        </div>
      )}
    </main>
  );
}
