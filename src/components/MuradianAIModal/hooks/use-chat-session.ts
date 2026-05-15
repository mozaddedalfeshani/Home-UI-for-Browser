"use client";

import { useEffect, useRef, useState } from "react";
import type { Message, TokenUsage } from "../types";

interface UseChatSessionParams {
  open: boolean;
  language: string;
  userName: string;
}

export function useChatSession({
  open,
  language,
  userName,
}: UseChatSessionParams) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<string>("");
  const summarizedCountRef = useRef<number>(0);

  useEffect(() => {
    if (!open) return;
    fetch("/api/ai/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: TokenUsage | null) => {
        if (data) setTokenUsage(data);
      })
      .catch(() => {});
  }, [open]);

  const handleSend = async (selectedAgentId: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    const genId = () =>
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    if (trimmedQuery === "/clear") {
      setQuery("");
      handleClearChat();
      return;
    }

    if (trimmedQuery === "/compact") {
      setQuery("");
      if (messages.length === 0) return;
      setMessages([
        { id: genId(), role: "assistant", content: "Context compacted." },
      ]);
      summarizedCountRef.current = 0;
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    const userMsg: Message = {
      id: genId(),
      role: "user",
      content: trimmedQuery,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery("");
    setIsLoading(true);

    const recentHistory = messages
      .slice(-4)
      .map((m) => ({ role: m.role, content: m.content }));
    const olderThanWindow = messages.slice(0, -4);
    const newlyEvicted = olderThanWindow
      .slice(summarizedCountRef.current)
      .map((m) => ({ role: m.role, content: m.content }));
    const pendingSummarizedCount = olderThanWindow.length;

    const assistantMsgId = genId();

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedQuery,
          history: recentHistory,
          historySummary: summaryRef.current || undefined,
          newlyEvicted,
          agentId: selectedAgentId || undefined,
          uiLanguage: language,
          userName,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
          resetAt?: string;
          tokensUsed?: number;
          tokenLimit?: number;
          windowHours?: number;
        };
        if (errorData.error === "out_of_context") {
          const resetAt = errorData.resetAt
            ? new Date(errorData.resetAt)
            : null;
          const resetMsg = resetAt
            ? ` Resets at ${resetAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
            : "";
          const limitDisplay =
            errorData.tokenLimit?.toLocaleString() ?? "3,000";
          const hoursDisplay = errorData.windowHours ?? 10;
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: `⚠️ You've used all ${limitDisplay} tokens for this ${hoursDisplay}-hour window.${resetMsg}`,
            },
          ]);
          if (errorData.tokensUsed !== undefined) {
            setTokenUsage({
              tokensUsed: errorData.tokensUsed,
              tokenLimit:
                errorData.tokenLimit !== undefined
                  ? errorData.tokenLimit
                  : 3_000,
              resetAt: errorData.resetAt ?? "",
            });
          }
          return;
        }
        throw new Error(errorData.error || "Failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ]);

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data) as {
              t?: string;
              v?: string;
              tokensUsed?: number;
              tokenLimit?: number | null;
              resetAt?: string | null;
              choices?: Array<{ delta?: { content?: string } }>;
            };

            if (parsed.t === "s") {
              summaryRef.current = parsed.v ?? "";
              summarizedCountRef.current = pendingSummarizedCount;
              continue;
            }

            if (parsed.t === "usage") {
              setTokenUsage({
                tokensUsed: parsed.tokensUsed ?? 0,
                tokenLimit:
                  parsed.tokenLimit !== undefined ? parsed.tokenLimit : 3_000,
                resetAt: parsed.resetAt !== undefined ? parsed.resetAt : "",
              });
              continue;
            }

            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (!content) continue;
            accumulatedContent += content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: accumulatedContent }
                  : m,
              ),
            );
          } catch {
            // ignore incomplete chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const hasPlaceholder = prev.some((m) => m.id === assistantMsgId);
        const errMsg: Message = {
          id: assistantMsgId,
          role: "assistant",
          content: "Sorry, I couldn't answer that right now. Please try again.",
        };
        return hasPlaceholder
          ? prev.map((m) => (m.id === assistantMsgId ? errMsg : m))
          : [...prev, errMsg];
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    summaryRef.current = "";
    summarizedCountRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCopyMessage = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // clipboard access may be denied
    }
  };

  return {
    query,
    setQuery,
    messages,
    isLoading,
    copiedId,
    tokenUsage,
    inputRef,
    handleSend,
    handleClearChat,
    handleCopyMessage,
  };
}
