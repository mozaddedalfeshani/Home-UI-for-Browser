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
  Save,
  Trash2,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChipIcon } from "@hugeicons/core-free-icons";
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

interface MuradianAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MuradianAIModal = ({ open, onOpenChange }: MuradianAIModalProps) => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] =
    useState<MuradianAskAgentId>("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentToDelete, setAgentToDelete] = useState<MuradianAskAgent | null>(
    null,
  );
  const [agentToEdit, setAgentToEdit] = useState<MuradianAskAgent | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editVisibility, setEditVisibility] =
    useState<MuradianAskAgentVisibility>("private");
  const [publicAgents, setPublicAgents] = useState<MuradianAskAgent[]>([]);
  const [isPublicSearchLoading, setIsPublicSearchLoading] = useState(false);
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const agents = useMuradianAskAgentStore((state) => state.agents);
  const fetchAgents = useMuradianAskAgentStore((state) => state.fetchAgents);
  const createAgent = useMuradianAskAgentStore((state) => state.createAgent);
  const updateAgent = useMuradianAskAgentStore((state) => state.updateAgent);
  const deleteAgent = useMuradianAskAgentStore((state) => state.deleteAgent);
  const selectedAgent = [...agents, ...publicAgents].find(
    (agent) => agent.id === selectedAgentId,
  );
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(agentSearch.trim().toLowerCase()),
  );
  const filteredPublicAgents = publicAgents.filter(
    (agent) => !agents.some((ownAgent) => ownAgent.id === agent.id),
  );

  useEffect(() => {
    if (!open) return;

    setQuery("");
    setAnswer("");
    setAgentSearch("");
    setPublicAgents([]);
    fetchAgents();
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [fetchAgents, open]);

  useEffect(() => {
    const query = agentSearch.trim();
    if (!open || query.length < 2) {
      setPublicAgents([]);
      setIsPublicSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsPublicSearchLoading(true);

    fetch(`/api/ai/agents/public?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { agents: [] }))
      .then((data) => {
        const nextPublicAgents = (data.agents ?? []).map(
          (agent: Partial<MuradianAskAgent>) => ({
            ...agent,
            systemInstruction: "",
            visibility: "public",
          }),
        ) as MuradianAskAgent[];
        setPublicAgents(nextPublicAgents);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to search public MuradianAsk agents", error);
        setPublicAgents([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsPublicSearchLoading(false);
        }
      });

    return () => controller.abort();
  }, [agentSearch, open]);

  useEffect(() => {
    const handleAgentStorageChange = (event: StorageEvent) => {
      if (event.key === "muradian-ask-agent-store") {
        useMuradianAskAgentStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleAgentStorageChange);

    return () => {
      window.removeEventListener("storage", handleAgentStorageChange);
    };
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

    setAnswer("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedQuery,
          agentId: selectedAgentId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let accumulatedContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (!content) continue;
            accumulatedContent += content;
            setAnswer(accumulatedContent);
          } catch {
            // Ignore incomplete streaming chunks.
          }
        }
      }
    } catch (error) {
      console.error("Quick Ask Error:", error);
      setAnswer("Sorry, I could not answer that right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const maxHeight = 76;
    input.style.height = "40px";
    input.style.height = `${Math.min(input.scrollHeight, maxHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [query, open]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
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

    if (selectedAgentId === agentToDelete.id) {
      setSelectedAgentId("");
    }

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
        const nextAgent = await createAgent({
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: editVisibility,
        });
        setSelectedAgentId(nextAgent.id);
      }

      setIsAgentEditorOpen(false);
      setAgentToEdit(null);
    } finally {
      setIsSavingAgent(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer.trim()) return;

    try {
      await navigator.clipboard.writeText(answer);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy answer:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContentBottom
          hideDefaultClose
          className="w-full border-0 bg-transparent p-2 shadow-none sm:bottom-8 sm:max-w-2xl"
        >
          <DialogTitle className="sr-only">MuradianAsk AI</DialogTitle>
          <div className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-[20px] bg-background/78 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 p-1.5">
                <Textarea
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="max-h-[76px] min-h-10 flex-1 resize-none rounded-[18px] border-0 bg-transparent px-4 py-2.5 text-sm leading-5 shadow-none focus-visible:ring-0 dark:bg-transparent"
                  disabled={isLoading}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 shrink-0 gap-1.5 rounded-full border border-border/50 bg-background/55 px-2.5 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
                      aria-label="Select agent"
                    >
                      <HugeiconsIcon
                        icon={AiChipIcon}
                        size={15}
                        strokeWidth={2}
                      />
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
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
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
                          <HugeiconsIcon
                            icon={AiChipIcon}
                            size={16}
                            strokeWidth={2}
                          />
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
                        onChange={(event) => setAgentSearch(event.target.value)}
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
                          selectedAgentId === agent.id &&
                            "border-primary/20 bg-primary/10",
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
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleEditAgent(agent);
                              }}
                              className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100"
                              aria-label={`Edit ${agent.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
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
                          selectedAgentId === agent.id &&
                            "border-primary/20 bg-primary/10",
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
              </div>

              {(answer || isLoading) && (
                <div className="px-5 py-4">
                  {answer ? (
                    <div className="space-y-3">
                      <div className="prose max-w-none text-sm leading-6 dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {answer}
                        </ReactMarkdown>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyAnswer}
                          className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContentBottom>
      </Dialog>

      <ConfirmDialog
        open={Boolean(agentToDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setAgentToDelete(null);
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
        onOpenChange={(nextOpen) => {
          setIsAgentEditorOpen(nextOpen);
          if (!nextOpen) setAgentToEdit(null);
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
              <span className="text-sm font-medium text-muted-foreground">
                Agent name
              </span>
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="h-12 rounded-2xl bg-background"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Short description
              </span>
              <Input
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="h-12 rounded-2xl bg-background"
              />
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Visibility
              </span>
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
              <span className="text-sm font-medium text-muted-foreground">
                Agent rules
              </span>
              <Textarea
                value={editRules}
                onChange={(event) => setEditRules(event.target.value)}
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
                disabled={
                  !editName.trim() || !editRules.trim() || isSavingAgent
                }
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
