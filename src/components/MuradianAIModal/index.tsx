"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Sidebar from "./sidebar";
import MainContent from "./main-content";
import { useMuradianAiStore, Message } from "@/store/muradianAiStore";
import { useAgentStore } from "@/store/agentStore";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";

interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MuradianAIModal = ({
  open,
  onOpenChange,
}: MuradianAIModalProps) => {
  const { 
    messages, 
    setMessages, 
    addMessage, 
    saveCurrentSession,
    fetchSessions,
    activeAgentId
  } = useMuradianAiStore();

  const { agents } = useAgentStore();
  const activeAgent = agents.find(a => a.id === activeAgentId);
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-v4-flash");
  const [isAutoModel] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOutOfContext, setIsOutOfContext] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastCheckedLengthRef = useRef(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchSessions();
    }
  }, [open, fetchSessions]);

  // Model switching logic
  useEffect(() => {
    if (isAutoModel && messages.length > 0 && messages.length % 5 === 0 && messages.length !== lastCheckedLengthRef.current) {
      lastCheckedLengthRef.current = messages.length;
      const detectComplexity = async () => {
        try {
          const res = await fetch("/api/ai/detect-complexity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
          });
          if (res.ok) {
            const data = await res.json();
            setSelectedModel(data.model);
          }
        } catch (e) {
          console.error("Failed to detect complexity", e);
        }
      };
      detectComplexity();
    }
  }, [messages.length, isAutoModel, messages]);

  const handleSend = async () => {
    if (!query.trim() || isLoading || isOutOfContext) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query.trim(),
    };

    addMessage(userMessage);
    setQuery("");
    setIsLoading(true);

    try {
      const systemPrompt = activeAgent?.rules || "You are a professional Office Assistant. Your primary language is Bangla. Always respond in Bangla by default. Give direct answers and keep them as simple as possible. Avoid unnecessary explanations unless explicitly asked.";
      
      const systemMessage = {
        role: "system" as const,
        content: systemPrompt
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // DeepSeek strictly requires content to be a string. It will reject the OpenAI Vision array format.
          messages: [systemMessage, ...messages, userMessage].map(m => {
            return { role: m.role, content: m.content };
          }),
          provider: "deepseek",
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 && errorData.error === "out_of_context") {
          setIsOutOfContext(true);
          addMessage({ 
            id: crypto.randomUUID(), 
            role: "assistant", 
            content: "You are out of context. You have reached your monthly token limit of 100,000 tokens." 
          });
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = { id: assistantMessageId, role: "assistant", content: "" };
      setMessages([...messages, userMessage, assistantMessage]);

      let accumulatedContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              accumulatedContent += content;
              
              setMessages(
                [...messages, userMessage, { id: assistantMessageId, role: "assistant", content: accumulatedContent }]
              );
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      const updatedMessages: Message[] = [
        ...messages, 
        userMessage, 
        { id: assistantMessageId, role: "assistant" as const, content: accumulatedContent }
      ];
      setMessages(updatedMessages);

      let sessionTitle: string | undefined = undefined;

      // Handle title generation
      if (messages.length === 0) {
        // Initial quick title
        sessionTitle = userMessage.content.slice(0, 30) + "...";
      } else if (updatedMessages.length === 4) {
        // We have exactly 4 messages (2 user + 2 assistant). Let's generate a proper title.
        try {
          const titleRes = await fetch("/api/ai/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: updatedMessages })
          });
          if (titleRes.ok) {
            const data = await titleRes.json();
            sessionTitle = data.title;
          }
        } catch (e) {
          console.error("Failed to generate title", e);
        }
      }

      await saveCurrentSession(sessionTitle);

    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({ 
        id: crypto.randomUUID(), 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please check your API configuration." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          hideDefaultClose
          className="max-w-[95vw] w-[95vw] h-[95vh] p-0 border border-border bg-background shadow-2xl rounded-3xl overflow-hidden flex flex-row"
          onInteractOutside={(e) => {
            e.preventDefault();
            toast.warning("Click the Close badge to dismiss the AI panel.");
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmClose(true)}
            className="absolute right-6 top-6 z-50 rounded-full bg-background/80 backdrop-blur-md px-4 py-1.5 shadow-sm text-secondary-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            Close
          </Button>

          <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

          <MainContent 
            query={query} 
            setQuery={setQuery} 
            inputRef={inputRef} 
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            isOutOfContext={isOutOfContext}
            onSaveHistory={() => saveCurrentSession("Manually Saved Session")}
          />
          <DialogTitle className="sr-only">Muradian AI - Ask Anything</DialogTitle>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={showConfirmClose} 
        onOpenChange={setShowConfirmClose}
        title="Close Muradian AI?"
        description="Are you sure you want to close the AI panel? Your active chat session will be preserved."
        confirmText="Yes, close"
        cancelText="Cancel"
        onConfirm={() => {
          setShowConfirmClose(false);
          onOpenChange(false);
        }}
        variant="warning"
      />
    </>
  );
};

export default MuradianAIModal;
