"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContentBottom,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useChatSession } from "./hooks/use-chat-session";
import { useAgentManager } from "./hooks/use-agent-manager";
import { ChatWindow } from "./chat/ChatWindow";
import { ChatInput } from "./chat/ChatInput";
import { MarketplaceView } from "./marketplace/MarketplaceView";
import { AgentFormView } from "./agent/AgentFormView";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiChipIcon,
  AiNetworkIcon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { MuradianAIModalProps } from "./types";

type ModalView = "chat" | "marketplace" | "agent-form";

export default function MuradianAIModal({
  open,
  onOpenChange,
}: MuradianAIModalProps) {
  const language = useSettingsStore((state) => state.language);
  const userName = useAuthStore((state) => {
    const name = state.user?.name?.trim() ?? "";
    return name.includes("@") ? "" : name;
  });
  const userRole = useAuthStore((state) => state.user?.role ?? "free");

  const [view, setView] = useState<ModalView>("chat");

  const chat = useChatSession({ open, language, userName });
  const agentMgr = useAgentManager({ open });

  const handleOpenMarketplace = () => setView("marketplace");

  const handleEditAgent = (
    agent: Parameters<typeof agentMgr.handleEditAgent>[0],
  ) => {
    agentMgr.handleEditAgent(agent);
    setView("agent-form");
  };

  const handleAddAgent = () => {
    agentMgr.handleAddAgent();
    setView("agent-form");
  };

  const handleFormBack = () => setView("marketplace");

  const handleFormSave = async (
    e: Parameters<typeof agentMgr.handleSaveAgent>[0],
  ) => {
    await agentMgr.handleSaveAgent(e);
    setView("marketplace");
  };

  const handleUseAgent = (id: string) => {
    agentMgr.setSelectedAgentId(id);
    setView("chat");
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setView("chat");
          onOpenChange(next);
        }}
      >
        <DialogContentBottom
          hideDefaultClose
          className="w-full border-0 bg-transparent p-2 shadow-none sm:bottom-8 sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">MuradianAsk AI</DialogTitle>
          <div className="mx-auto w-full max-w-4xl">
            <div
              className="flex flex-col overflow-hidden rounded-[20px] border border-black/15 bg-background/78 backdrop-blur-sm dark:border-white/15"
              style={{ height: "min(680px, calc(100vh - 5rem))" }}
            >
              {view === "marketplace" && (
                <MarketplaceView
                  selectedAgentId={agentMgr.selectedAgentId}
                  onBack={() => setView("chat")}
                  onUseAgent={handleUseAgent}
                  onAddAgent={handleAddAgent}
                  onEditAgent={handleEditAgent}
                  onDeleteAgent={agentMgr.setAgentToDelete}
                />
              )}

              {view === "agent-form" && (
                <AgentFormView
                  agentToEdit={agentMgr.agentToEdit}
                  editName={agentMgr.editName}
                  editDescription={agentMgr.editDescription}
                  editRules={agentMgr.editRules}
                  editVisibility={agentMgr.editVisibility}
                  isSaving={agentMgr.isSavingAgent}
                  onNameChange={agentMgr.setEditName}
                  onDescriptionChange={agentMgr.setEditDescription}
                  onRulesChange={agentMgr.setEditRules}
                  onVisibilityChange={agentMgr.setEditVisibility}
                  onSave={handleFormSave}
                  onBack={handleFormBack}
                />
              )}

              {view === "chat" && (
                <>
                  <ChatWindow
                    messages={chat.messages}
                    isLoading={chat.isLoading}
                    copiedId={chat.copiedId}
                    onCopy={chat.handleCopyMessage}
                  />
                  <ChatInput
                    query={chat.query}
                    isLoading={chat.isLoading}
                    open={open}
                    tokenUsage={chat.tokenUsage}
                    inputRef={chat.inputRef}
                    onQueryChange={chat.setQuery}
                    onSend={() => chat.handleSend(agentMgr.selectedAgentId)}
                    userRole={userRole}
                    agentPickerSlot={
                      <>
                        {/* Model picker — lite/plus only */}
                        {(userRole === "lite" || userRole === "plus") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                className="group h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border/50 bg-background/55 px-0 text-muted-foreground shadow-sm backdrop-blur-md transition-all duration-500 hover:w-auto hover:px-3 hover:bg-accent hover:text-foreground"
                                aria-label="Select AI model"
                              >
                                <HugeiconsIcon
                                  icon={AiNetworkIcon}
                                  size={14}
                                  strokeWidth={2}
                                  className="shrink-0"
                                />
                                <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-500 group-hover:max-w-[80px] group-hover:ml-1.5 group-hover:opacity-100">
                                  AI Models
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                AI Models
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {[
                                { name: "GPT 5.5", provider: "OpenAI" },
                                {
                                  name: "Gemini 3.1 Flash",
                                  provider: "Google",
                                },
                                {
                                  name: "DeepSeek V4 Pro",
                                  provider: "DeepSeek",
                                },
                                {
                                  name: "DeepSeek V4 Flash",
                                  provider: "DeepSeek",
                                },
                              ].map((m) => (
                                <DropdownMenuItem
                                  key={m.name}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    if (userRole === "lite")
                                      toast.info("Please upgrade to Premium");
                                  }}
                                  className="flex items-center justify-between gap-2 cursor-not-allowed opacity-60"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {m.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {m.provider}
                                    </p>
                                  </div>
                                  <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-border/40 text-muted-foreground">
                                    {userRole === "lite" ? "Plus" : "Soon"}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Agent picker */}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleOpenMarketplace}
                          className="group h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border/50 bg-background/55 px-0 text-muted-foreground shadow-sm backdrop-blur-md transition-all duration-500 hover:w-auto hover:px-3 hover:bg-accent hover:text-foreground"
                          aria-label="Open agent marketplace"
                        >
                          <HugeiconsIcon
                            icon={AiChipIcon}
                            size={14}
                            strokeWidth={2}
                            className={cn(
                              "shrink-0",
                              agentMgr.selectedAgent ? "text-primary" : "",
                            )}
                          />
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-500 group-hover:max-w-[120px] group-hover:ml-1.5 group-hover:opacity-100">
                            {agentMgr.selectedAgent?.name ?? "Normal ask"}
                          </span>
                          {agentMgr.selectedAgent?.visibility === "public" && (
                            <HugeiconsIcon
                              icon={Globe02Icon}
                              size={11}
                              className="ml-1 shrink-0 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            />
                          )}
                        </Button>
                      </>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </DialogContentBottom>
      </Dialog>

      <ConfirmDialog
        open={Boolean(agentMgr.agentToDelete)}
        onOpenChange={(next) => {
          if (!next) agentMgr.setAgentToDelete(null);
        }}
        title="Delete agent?"
        description={`This will remove "${agentMgr.agentToDelete?.name ?? "this agent"}" permanently.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={agentMgr.handleDeleteAgent}
        variant="warning"
      />
    </>
  );
}
