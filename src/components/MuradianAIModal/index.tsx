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
import { AiChipIcon } from "@hugeicons/core-free-icons";
import { ChevronDown, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MuradianAIModalProps } from "./types";

type ModalView = "chat" | "marketplace" | "agent-form";

export default function MuradianAIModal({ open, onOpenChange }: MuradianAIModalProps) {
  const language = useSettingsStore((state) => state.language);
  const userName = useAuthStore((state) => {
    const name = state.user?.name?.trim() ?? "";
    return name.includes("@") ? "" : name;
  });

  const [view, setView] = useState<ModalView>("chat");

  const chat = useChatSession({ open, language, userName });
  const agentMgr = useAgentManager({ open });

  const handleOpenMarketplace = () => setView("marketplace");

  const handleOpenAgentForm = () => setView("agent-form");

  const handleEditAgent = (agent: Parameters<typeof agentMgr.handleEditAgent>[0]) => {
    agentMgr.handleEditAgent(agent);
    setView("agent-form");
  };

  const handleAddAgent = () => {
    agentMgr.handleAddAgent();
    setView("agent-form");
  };

  const handleFormBack = () => setView("marketplace");

  const handleFormSave = async (e: Parameters<typeof agentMgr.handleSaveAgent>[0]) => {
    await agentMgr.handleSaveAgent(e);
    setView("marketplace");
  };

  const handleUseAgent = (id: string) => {
    agentMgr.setSelectedAgentId(id);
    setView("chat");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => { setView("chat"); onOpenChange(next); }}>
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
                    hasMessages={chat.messages.length > 0}
                    open={open}
                    tokenUsage={chat.tokenUsage}
                    inputRef={chat.inputRef}
                    onQueryChange={chat.setQuery}
                    onSend={() => chat.handleSend(agentMgr.selectedAgentId)}
                    onClear={chat.handleClearChat}
                    agentPickerSlot={
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleOpenMarketplace}
                        className="h-9 shrink-0 gap-1.5 rounded-full border border-border/50 bg-background/55 px-2.5 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Open agent marketplace"
                      >
                        <HugeiconsIcon icon={AiChipIcon} size={15} strokeWidth={2} />
                        <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
                          {agentMgr.selectedAgent?.name ?? "Normal ask"}
                        </span>
                        {agentMgr.selectedAgent?.visibility === "public" ? (
                          <Globe2 className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </Button>
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
        onOpenChange={(next) => { if (!next) agentMgr.setAgentToDelete(null); }}
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
