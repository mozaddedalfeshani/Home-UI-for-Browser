"use client";

import { type FormEvent } from "react";
import { Bot, Globe2, Lock, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { MuradianAskAgent, MuradianAskAgentVisibility } from "@/store/muradianAskAgentStore";

interface AgentEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  agentToEdit: MuradianAskAgent | null;
  agentToDelete: MuradianAskAgent | null;
  editName: string;
  editDescription: string;
  editRules: string;
  editVisibility: MuradianAskAgentVisibility;
  isSaving: boolean;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onRulesChange: (v: string) => void;
  onVisibilityChange: (v: MuradianAskAgentVisibility) => void;
  onSave: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onDeleteOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function AgentEditor({
  isOpen,
  onOpenChange,
  agentToEdit,
  agentToDelete,
  editName,
  editDescription,
  editRules,
  editVisibility,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onRulesChange,
  onVisibilityChange,
  onSave,
  onCancel,
  onDeleteOpenChange,
  onConfirmDelete,
}: AgentEditorProps) {
  return (
    <>
      <ConfirmDialog
        open={Boolean(agentToDelete)}
        onOpenChange={(next) => { if (!next) onDeleteOpenChange(false); }}
        title="Delete agent?"
        description={`This will remove "${agentToDelete?.name ?? "this agent"}" from MuradianAsk AI on this device.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onConfirmDelete}
        variant="warning"
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
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

          <form onSubmit={onSave} className="mt-4 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Agent name</span>
              <Input
                value={editName}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-12 rounded-2xl bg-background"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted-foreground">Short description</span>
              <Input
                value={editDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
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
                  onClick={() => onVisibilityChange("private")}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </Button>
                <Button
                  type="button"
                  variant={editVisibility === "public" ? "default" : "ghost"}
                  className="h-11 rounded-xl"
                  onClick={() => onVisibilityChange("public")}
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
                onChange={(e) => onRulesChange(e.target.value)}
                className="min-h-[18rem] resize-y rounded-2xl bg-background p-4 text-sm leading-6"
              />
            </label>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" className="rounded-full px-5" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-5"
                disabled={!editName.trim() || !editRules.trim() || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save rules"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
