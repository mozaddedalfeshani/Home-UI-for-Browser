"use client";

import { FormEvent, RefObject, useEffect, useState } from "react";
import { Message } from "@/store/muradianAiStore";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeHeader } from "./welcome-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bot, Check, ChevronDown, Pencil, Save, Trash2 } from "lucide-react";
import {
  MuradianAskAgent,
  MuradianAskAgentId,
  useMuradianAskAgentStore,
} from "@/store/muradianAskAgentStore";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MainContentProps {
  query: string;
  setQuery: (v: string) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messages: Message[];
  isLoading: boolean;
  onSend: () => void;
  isOutOfContext?: boolean;
  onSaveHistory?: () => void;
  selectedAgentId: MuradianAskAgentId;
  onSelectedAgentChange: (agentId: MuradianAskAgentId) => void;
  agents: MuradianAskAgent[];
}

export default function MainContent({
  query,
  setQuery,
  inputRef,
  messages,
  isLoading,
  onSend,
  isOutOfContext,
  onSaveHistory,
  selectedAgentId,
  onSelectedAgentChange,
  agents,
}: MainContentProps) {
  const isChatActive = messages.length > 0;
  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];
  const createAgent = useMuradianAskAgentStore((state) => state.createAgent);
  const deleteAgent = useMuradianAskAgentStore((state) => state.deleteAgent);
  const updateAgent = useMuradianAskAgentStore((state) => state.updateAgent);
  const [agentSearch, setAgentSearch] = useState("");
  const [agentToDelete, setAgentToDelete] = useState<MuradianAskAgent | null>(
    null,
  );
  const [agentToEdit, setAgentToEdit] = useState<MuradianAskAgent | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRules, setEditRules] = useState("");
  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(agentSearch.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!agentToEdit) {
      setEditName("");
      setEditDescription("");
      setEditRules("");
      return;
    }

    setEditName(agentToEdit.name);
    setEditDescription(agentToEdit.description);
    setEditRules(agentToEdit.systemInstruction);
  }, [agentToEdit]);

  const handleEditAgent = (agent: MuradianAskAgent) => {
    setAgentToEdit(agent);
    setIsAgentEditorOpen(true);
  };

  const handleAddAgent = () => {
    setAgentToEdit(null);
    setEditName("");
    setEditDescription("");
    setEditRules("");
    setIsAgentEditorOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    const remainingAgents = agents.filter(
      (agent) => agent.id !== agentToDelete.id,
    );

    await deleteAgent(agentToDelete.id);

    if (selectedAgentId === agentToDelete.id) {
      onSelectedAgentChange(remainingAgents[0]?.id ?? "");
    }

    setAgentToDelete(null);
  };

  const handleSaveAgentRules = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editName.trim() || !editRules.trim()) return;

    setIsSavingAgent(true);

    try {
      if (agentToEdit) {
        await updateAgent(agentToEdit.id, {
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: agentToEdit.visibility ?? "private",
        });
      } else {
        const nextAgent = await createAgent({
          name: editName.trim(),
          description: editDescription.trim(),
          systemInstruction: editRules.trim(),
          visibility: "private",
        });
        onSelectedAgentChange(nextAgent.id);
      }

      setIsAgentEditorOpen(false);
      setAgentToEdit(null);
    } finally {
      setIsSavingAgent(false);
    }
  };

  return (
    <main className="flex-1 relative flex flex-col bg-background h-full overflow-hidden">
      {/* Top gradient to protect the Close badge and provide a smooth scroll-fade effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/80 to-transparent z-40 pointer-events-none" />

      <div className="flex h-full min-h-0 flex-col px-8 pb-8 pt-16">
        <div className="mx-auto flex h-full w-full min-h-0 flex-col gap-8 relative z-10">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-12">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 gap-1.5 rounded-full border border-border/50 bg-background/55 px-3 text-muted-foreground shadow-sm backdrop-blur-md hover:bg-accent/60 hover:text-foreground"
                  >
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {selectedAgent?.name ?? "Normal ask"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
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
                      <Bot className="h-3.5 w-3.5" />
                      New
                    </Button>
                  </div>
                  <DropdownMenuItem
                    onSelect={() => onSelectedAgentChange("")}
                    className={cn(
                      "mb-2 cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
                      !selectedAgentId && "border-primary/20 bg-primary/10",
                    )}
                  >
                    <div className="flex w-full items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            Normal ask
                          </p>
                          {!selectedAgentId ? (
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          Use regular MuradianAsk memory
                        </p>
                      </div>
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
                  {filteredAgents.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground">
                      {agents.length === 0
                        ? "No agents yet. Add your first preference."
                        : "No agent found."}
                    </div>
                  ) : null}
                  {filteredAgents.map((agent) => (
                    <DropdownMenuItem
                      key={agent.id}
                      onSelect={() => onSelectedAgentChange(agent.id)}
                      className={cn(
                        "group cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
                        selectedAgentId === agent.id &&
                          "border-primary/20 bg-primary/10",
                      )}
                    >
                      <div className="flex w-full items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-muted p-1.5 text-primary transition-colors group-hover:bg-primary/10">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {agent.name}
                            </p>
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
                                className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-35"
                                aria-label={`Delete ${agent.name}`}
                                disabled={agents.length <= 1}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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

      <ConfirmDialog
        open={Boolean(agentToDelete)}
        onOpenChange={(open) => {
          if (!open) setAgentToDelete(null);
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
        onOpenChange={(open) => {
          setIsAgentEditorOpen(open);
          if (!open) setAgentToEdit(null);
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

          <form onSubmit={handleSaveAgentRules} className="mt-4 grid gap-5">
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
    </main>
  );
}
