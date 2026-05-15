"use client";

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
import { AgentPicker } from "./agent/AgentPicker";
import { AgentEditor } from "./agent/AgentEditor";
import type { MuradianAIModalProps } from "./types";

export default function MuradianAIModal({ open, onOpenChange }: MuradianAIModalProps) {
  const language = useSettingsStore((state) => state.language);
  const userName = useAuthStore((state) => {
    const name = state.user?.name?.trim() ?? "";
    return name.includes("@") ? "" : name;
  });

  const chat = useChatSession({ open, language, userName });
  const agentMgr = useAgentManager({ open });

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
                  <AgentPicker
                    selectedAgent={agentMgr.selectedAgent}
                    selectedAgentId={agentMgr.selectedAgentId}
                    filteredAgents={agentMgr.filteredAgents}
                    filteredPublicAgents={agentMgr.filteredPublicAgents}
                    agentSearch={agentMgr.agentSearch}
                    isPublicSearchLoading={agentMgr.isPublicSearchLoading}
                    agents={agentMgr.agents}
                    onSelect={agentMgr.setSelectedAgentId}
                    onSearchChange={agentMgr.setAgentSearch}
                    onAdd={agentMgr.handleAddAgent}
                    onEdit={agentMgr.handleEditAgent}
                    onDelete={agentMgr.setAgentToDelete}
                  />
                }
              />
            </div>
          </div>
        </DialogContentBottom>
      </Dialog>

      <AgentEditor
        isOpen={agentMgr.isAgentEditorOpen}
        onOpenChange={(next) => {
          agentMgr.setIsAgentEditorOpen(next);
          if (!next) agentMgr.setAgentToEdit(null);
        }}
        agentToEdit={agentMgr.agentToEdit}
        agentToDelete={agentMgr.agentToDelete}
        editName={agentMgr.editName}
        editDescription={agentMgr.editDescription}
        editRules={agentMgr.editRules}
        editVisibility={agentMgr.editVisibility}
        isSaving={agentMgr.isSavingAgent}
        onNameChange={agentMgr.setEditName}
        onDescriptionChange={agentMgr.setEditDescription}
        onRulesChange={agentMgr.setEditRules}
        onVisibilityChange={agentMgr.setEditVisibility}
        onSave={agentMgr.handleSaveAgent}
        onCancel={() => {
          agentMgr.setIsAgentEditorOpen(false);
          agentMgr.setAgentToEdit(null);
        }}
        onDeleteOpenChange={(open) => { if (!open) agentMgr.setAgentToDelete(null); }}
        onConfirmDelete={agentMgr.handleDeleteAgent}
      />
    </>
  );
}
