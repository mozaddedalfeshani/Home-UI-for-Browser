"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Globe2,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChipIcon, SentIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogContentBottom,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  MuradianAskAgent,
  MuradianAskAgentId,
  MuradianAskAgentVisibility,
  useMuradianAskAgentStore,
} from "@/store/muradianAskAgentStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function formatTimeUntil(resetAt: string): string {
  if (!resetAt) return "";
  const ms = new Date(resetAt).getTime() - Date.now();
  if (ms <= 0) return "soon";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function TokenUsageBar({
  usage,
}: {
  usage: { tokensUsed: number; tokenLimit: number; resetAt: string };
}) {
  const pct = Math.min((usage.tokensUsed / usage.tokenLimit) * 100, 100);
  const remaining = Math.max(usage.tokenLimit - usage.tokensUsed, 0);
  const isWarning = pct >= 70;
  const isDanger = pct >= 90;

  return (
    <div className="mt-1.5 px-1">
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums",
            isDanger
              ? "text-destructive"
              : isWarning
                ? "text-amber-500"
                : "text-muted-foreground/60",
          )}
        >
          {usage.tokensUsed.toLocaleString()} / {usage.tokenLimit.toLocaleString()} tokens
        </span>
        {remaining === 0 ? (
          <span className="text-[10px] text-destructive">
            resets in {formatTimeUntil(usage.resetAt)}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">
            {remaining.toLocaleString()} left · resets in {formatTimeUntil(usage.resetAt)}
          </span>
        )}
      </div>
      <div className="h-0.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isDanger ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-primary/50",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const MuradianAIModal = ({ open, onOpenChange }: MuradianAIModalProps) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<MuradianAskAgentId>("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentToDelete, setAgentToDelete] = useState<MuradianAskAgent | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<MuradianAskAgent | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editVisibility, setEditVisibility] = useState<MuradianAskAgentVisibility>("private");
  const [publicAgents, setPublicAgents] = useState<MuradianAskAgent[]>([]);
  const [isPublicSearchLoading, setIsPublicSearchLoading] = useState(false);
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{
    tokensUsed: number;
    tokenLimit: number;
    resetAt: string;
  } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Rolling conversation summary for messages older than the last 5
  const summaryRef = useRef<string>("");
  const summarizedCountRef = useRef<number>(0);

  const language = useSettingsStore((state) => state.language);
  const userName = useAuthStore((state) => {
    const name = state.user?.name?.trim() ?? "";
    return name.includes("@") ? "" : name;
  });
  const agents = useMuradianAskAgentStore((state) => state.agents);
  const fetchAgents = useMuradianAskAgentStore((state) => state.fetchAgents);
  const createAgent = useMuradianAskAgentStore((state) => state.createAgent);
  const updateAgent = useMuradianAskAgentStore((state) => state.updateAgent);
  const deleteAgent = useMuradianAskAgentStore((state) => state.deleteAgent);
  const selectedAgent = [...agents, ...publicAgents].find((a) => a.id === selectedAgentId);
  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.trim().toLowerCase()),
  );
  const filteredPublicAgents = publicAgents.filter(
    (a) => !agents.some((own) => own.id === a.id),
  );

  useEffect(() => {
    if (!open) return;
    setAgentSearch("");
    setPublicAgents([]);
    fetchAgents();
    setTimeout(() => inputRef.current?.focus(), 80);

    // Fetch current token window usage on open
    fetch("/api/ai/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { tokensUsed: number; tokenLimit: number; resetAt: string } | null) => {
        if (data) setTokenUsage(data);
      })
      .catch(() => {});
  }, [fetchAgents, open]);

  // Scroll to bottom whenever messages change or loading starts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "40px";
    input.style.height = `${Math.min(input.scrollHeight, 76)}px`;
    input.style.overflowY = input.scrollHeight > 76 ? "auto" : "hidden";
  }, [query, open]);

  useEffect(() => {
    const q = agentSearch.trim();
    if (!open || q.length < 2) {
      setPublicAgents([]);
      setIsPublicSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsPublicSearchLoading(true);

    fetch(`/api/ai/agents/public?query=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : { agents: [] }))
      .then((data) => {
        setPublicAgents(
          (data.agents ?? []).map((a: Partial<MuradianAskAgent>) => ({
            ...a,
            systemInstruction: "",
            visibility: "public",
          })) as MuradianAskAgent[],
        );
      })
      .catch((err) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setPublicAgents([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsPublicSearchLoading(false);
      });

    return () => controller.abort();
  }, [agentSearch, open]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "muradian-ask-agent-store") {
        useMuradianAskAgentStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!agentToEdit) {
      setEditName("");
      setEditDescription("");
      setEditRules("");
      setEditVisibility("private");
      return;
    }
    setEditName(agentToEdit.name);
    setEditDescription(agentToEdit.description);
    setEditRules(agentToEdit.systemInstruction);
    setEditVisibility(agentToEdit.visibility ?? "private");
  }, [agentToEdit]);

  const handleSend = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    const userMsg: Message = { id: genId(), role: "user", content: trimmedQuery };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery("");
    setIsLoading(true);

    // Last 4 prior messages = 5 context turns total (including current)
    const recentHistory = messages.slice(-4).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Messages that just fell outside the 5-turn window since last summarize
    // Server generates updated summary and sends it back via SSE — no public endpoint
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
        const errorData = await response.json().catch(() => ({})) as {
          error?: string;
          resetAt?: string;
          tokensUsed?: number;
          tokenLimit?: number;
        };
        if (errorData.error === "out_of_context") {
          const resetAt = errorData.resetAt ? new Date(errorData.resetAt) : null;
          const resetMsg = resetAt
            ? ` Resets at ${resetAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
            : "";
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: `⚠️ You've used all 5,000 tokens for this 10-hour window.${resetMsg}`,
            },
          ]);
          if (errorData.tokensUsed !== undefined) {
            setTokenUsage({
              tokensUsed: errorData.tokensUsed,
              tokenLimit: errorData.tokenLimit ?? 5000,
              resetAt: errorData.resetAt ?? "",
            });
          }
          return;
        }
        throw new Error(errorData.error || "Failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      // Add assistant placeholder message for streaming
      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

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
              tokenLimit?: number;
              resetAt?: string;
              choices?: Array<{ delta?: { content?: string } }>;
            };

            // Summary event emitted by server after [DONE]
            if (parsed.t === "s") {
              summaryRef.current = parsed.v ?? "";
              summarizedCountRef.current = pendingSummarizedCount;
              continue;
            }

            // Token usage event
            if (parsed.t === "usage") {
              setTokenUsage({
                tokensUsed: parsed.tokensUsed ?? 0,
                tokenLimit: parsed.tokenLimit ?? 5000,
                resetAt: parsed.resetAt ?? "",
              });
              continue;
            }

            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (!content) continue;
            accumulatedContent += content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m,
              ),
            );
          } catch {
            // ignore incomplete chunks
          }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
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
    } catch {}
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    handleSend();
  };

  const handleAddAgent = () => {
    setAgentToEdit(null);
    setEditName("");
    setEditDescription("");
    setEditRules("");
    setEditVisibility("private");
    setIsAgentEditorOpen(true);
  };

  const handleEditAgent = (agent: MuradianAskAgent) => {
    setAgentToEdit(agent);
    setIsAgentEditorOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    await deleteAgent(agentToDelete.id);
    if (selectedAgentId === agentToDelete.id) setSelectedAgentId("");
    setAgentToDelete(null);
  };

  const handleSaveAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editName.trim() || !editRules.trim()) return;
    setIsSavingAgent(true);
    try {
      if (agentToEdit) {
        await updateAgent(agentToEdit.id, {
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: editVisibility,
        });
      } else {
        const next = await createAgent({
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: editVisibility,
        });
        setSelectedAgentId(next.id);
      }
      setIsAgentEditorOpen(false);
      setAgentToEdit(null);
    } finally {
      setIsSavingAgent(false);
    }
  };

  const isTypingIndicatorVisible =
    isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContentBottom
          hideDefaultClose
          className="w-full border-0 bg-transparent p-2 shadow-none sm:bottom-8 sm:max-w-2xl"
        >
          <DialogTitle className="sr-only">MuradianAsk AI</DialogTitle>
          <div className="mx-auto w-full max-w-2xl">
            <div
              className="flex flex-col overflow-hidden rounded-[20px] bg-background/78 backdrop-blur-sm"
              style={{ height: "min(560px, calc(100vh - 5rem))" }}
            >
              {/* Messages area */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-2 scroll-smooth">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground/60">Ask me anything...</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "group flex flex-col gap-1",
                          msg.role === "user" ? "items-end" : "items-start",
                        )}
                      >
                        {msg.role === "user" ? (
                          <div className="max-w-[82%] rounded-2xl rounded-tr-none bg-zinc-100 px-4 py-2.5 text-sm dark:bg-zinc-800">
                            {msg.content}
                          </div>
                        ) : (
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
                                onClick={() => handleCopyMessage(msg)}
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
                        )}
                      </div>
                    ))}

                    {isTypingIndicatorVisible && (
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

              {/* Input bar */}
              <div className="shrink-0 border-t border-border/20 p-1.5">
                <div className="flex items-center gap-1.5">
                  <Textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="max-h-[76px] min-h-10 flex-1 resize-none rounded-[18px] border-0 bg-transparent px-4 py-2.5 text-sm leading-5 shadow-none focus-visible:ring-0 dark:bg-transparent"
                    disabled={isLoading}
                  />

                  {/* Clear chat */}
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChat}
                      title="New chat"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Agent picker */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 shrink-0 gap-1.5 rounded-full border border-border/50 bg-background/55 px-2.5 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Select agent"
                      >
                        <HugeiconsIcon icon={AiChipIcon} size={15} strokeWidth={2} />
                        <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
                          {selectedAgent?.name ?? "Normal ask"}
                        </span>
                        {selectedAgent?.visibility === "public" ? (
                          <Globe2 className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={10}
                      className="z-[150] w-[21rem] rounded-2xl border-border/60 bg-background/95 p-2.5 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-1">
                        <div>
                          <DropdownMenuLabel className="px-0 py-0 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Ask mode
                          </DropdownMenuLabel>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {selectedAgent?.name ?? "Normal ask"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 rounded-xl px-2.5 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddAgent();
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New
                        </Button>
                      </div>
                      <DropdownMenuItem
                        onSelect={() => setSelectedAgentId("")}
                        className={cn(
                          "mb-2 cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
                          !selectedAgentId && "border-primary/20 bg-primary/10",
                        )}
                      >
                        <div className="flex w-full items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                            <HugeiconsIcon icon={AiChipIcon} size={16} strokeWidth={2} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              Normal ask
                            </p>
                            <p className="truncate text-[0.7rem] text-muted-foreground">
                              Use regular MuradianAsk memory
                            </p>
                          </div>
                          {!selectedAgentId ? (
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                          ) : null}
                        </div>
                      </DropdownMenuItem>
                      <div className="border-t border-border/50 px-1 pb-2 pt-2">
                        <Input
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          placeholder="Search agents..."
                          className="h-9 rounded-xl border-border/70 bg-muted/35 text-sm"
                        />
                      </div>
                      {filteredAgents.length === 0 &&
                      filteredPublicAgents.length === 0 &&
                      !isPublicSearchLoading ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">
                          {agents.length === 0
                            ? "No agents yet. Add your first preference."
                            : agentSearch.trim().length < 2
                              ? "No private agent found. Type 2+ letters to search public agents."
                              : "No agent found."}
                        </div>
                      ) : null}
                      {filteredAgents.length > 0 ? (
                        <DropdownMenuLabel className="px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                          Your agents
                        </DropdownMenuLabel>
                      ) : null}
                      {filteredAgents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          onSelect={() => setSelectedAgentId(agent.id)}
                          className={cn(
                            "group cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
                            selectedAgentId === agent.id && "border-primary/20 bg-primary/10",
                          )}
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="rounded-lg bg-muted p-1.5 text-primary transition-colors group-hover:bg-primary/10">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {agent.name}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                                {(agent.visibility ?? "private") === "public" ? (
                                  <Globe2 className="h-3 w-3" />
                                ) : (
                                  <Lock className="h-3 w-3" />
                                )}
                                {(agent.visibility ?? "private") === "public"
                                  ? "Public"
                                  : "Private"}
                              </p>
                            </div>
                            <div className="ml-2 flex shrink-0 items-center gap-1">
                              {selectedAgentId === agent.id ? (
                                <Check className="h-4 w-4 shrink-0 text-primary" />
                              ) : null}
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditAgent(agent);
                                }}
                                className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                aria-label={`Edit ${agent.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setAgentToDelete(agent);
                                }}
                                className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                aria-label={`Delete ${agent.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {isPublicSearchLoading ? (
                        <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Searching public agents...
                        </div>
                      ) : null}
                      {filteredPublicAgents.length > 0 ? (
                        <DropdownMenuLabel className="px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                          Public agents
                        </DropdownMenuLabel>
                      ) : null}
                      {filteredPublicAgents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          onSelect={() => setSelectedAgentId(agent.id)}
                          className={cn(
                            "group cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
                            selectedAgentId === agent.id && "border-primary/20 bg-primary/10",
                          )}
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="rounded-lg bg-muted p-1.5 text-primary transition-colors group-hover:bg-primary/10">
                              <Globe2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {agent.name}
                              </p>
                              <p className="truncate text-[0.7rem] text-muted-foreground">
                                {agent.description || "Public agent"}
                              </p>
                            </div>
                            {selectedAgentId === agent.id ? (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            ) : null}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Send */}
                  <Button
                    type="button"
                    onClick={handleSend}
                    size="icon"
                    className={cn(
                      "h-9 w-9 shrink-0 rounded-full shadow-md transition-all",
                      query.trim() && !isLoading
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700",
                    )}
                    disabled={!query.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <HugeiconsIcon icon={SentIcon} size={16} />
                    )}
                  </Button>
                </div>
                {tokenUsage ? (
                  <TokenUsageBar usage={tokenUsage} />
                ) : (
                  <p className="mt-1 text-center text-[10px] text-muted-foreground/50">
                    AI-generated content may not be accurate.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContentBottom>
      </Dialog>

      <ConfirmDialog
        open={Boolean(agentToDelete)}
        onOpenChange={(next) => {
          if (!next) setAgentToDelete(null);
        }}
        title="Delete agent?"
        description={`This will remove "${agentToDelete?.name ?? "this agent"}" from MuradianAsk AI on this device.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAgent}
        variant="warning"
      />

      <Dialog
        open={isAgentEditorOpen}
        onOpenChange={(next) => {
          setIsAgentEditorOpen(next);
          if (!next) setAgentToEdit(null);
        }}
      >
        <DialogContent className="z-[170] max-h-[88vh] max-w-3xl overflow-y-auto rounded-3xl border-border/60 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-5 w-5 text-primary" />
              {agentToEdit ? "Edit agent rules" : "Add agent"}
            </DialogTitle>
            <DialogDescription>
              Save this agent to DB and keep it cached for faster switching.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAgent} className="mt-4 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Agent name</span>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-12 rounded-2xl bg-background"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Short description</span>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="h-12 rounded-2xl bg-background"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Visibility</span>
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background p-1">
                <Button
                  type="button"
                  variant={editVisibility === "private" ? "default" : "ghost"}
                  className="h-11 rounded-xl"
                  onClick={() => setEditVisibility("private")}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </Button>
                <Button
                  type="button"
                  variant={editVisibility === "public" ? "default" : "ghost"}
                  className="h-11 rounded-xl"
                  onClick={() => setEditVisibility("public")}
                >
                  <Globe2 className="h-4 w-4" />
                  Public
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Public agents can be found in search and used by other users.
              </p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Agent rules</span>
              <Textarea
                value={editRules}
                onChange={(e) => setEditRules(e.target.value)}
                className="min-h-[18rem] resize-y rounded-2xl bg-background p-4 text-sm leading-6"
              />
            </label>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-5"
                onClick={() => {
                  setIsAgentEditorOpen(false);
                  setAgentToEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-5"
                disabled={!editName.trim() || !editRules.trim() || isSavingAgent}
              >
                <Save className="h-4 w-4" />
                {isSavingAgent ? "Saving..." : "Save rules"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MuradianAIModal;
