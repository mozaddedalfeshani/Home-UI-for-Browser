"use client";

import { type FormEvent } from "react";
import { ArrowLeft, Bot, Globe2, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  MuradianAskAgent,
  MuradianAskAgentVisibility,
} from "@/store/muradianAskAgentStore";

interface AgentFormViewProps {
  agentToEdit: MuradianAskAgent | null;
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
  onBack: () => void;
}

export function AgentFormView({
  agentToEdit,
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
  onBack,
}: AgentFormViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/20 px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Bot className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">
            {agentToEdit ? "Edit agent" : "New agent"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <form id="agent-form" onSubmit={onSave} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Agent name
            </label>
            <Input
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Grammar Pro"
              className="h-10 rounded-xl bg-muted/30"
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Short description
            </label>
            <Input
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="One line about what this agent does"
              className="h-10 rounded-xl bg-muted/30"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/50 bg-muted/20 p-1">
              <button
                type="button"
                onClick={() => onVisibilityChange("private")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                  editVisibility === "private"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Lock className="h-3.5 w-3.5" />
                Private
              </button>
              <button
                type="button"
                onClick={() => onVisibilityChange("public")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                  editVisibility === "public"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Globe2 className="h-3.5 w-3.5" />
                Public
              </button>
            </div>
            {editVisibility === "public" && (
              <p className="text-[11px] text-muted-foreground">
                Public agents appear in the marketplace for all users.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Agent rules
            </label>
            <Textarea
              value={editRules}
              onChange={(e) => onRulesChange(e.target.value)}
              placeholder="Write the system instructions for this agent..."
              className="min-h-[200px] resize-none rounded-xl bg-muted/30 text-sm leading-6"
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/20 p-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full px-4"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="agent-form"
          size="sm"
          className="rounded-full px-4"
          disabled={!editName.trim() || !editRules.trim() || isSaving}
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving..." : "Save agent"}
        </Button>
      </div>
    </div>
  );
}
