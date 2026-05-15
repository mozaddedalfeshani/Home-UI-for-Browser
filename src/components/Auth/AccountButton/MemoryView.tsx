"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MEMORY_LENGTH } from "./types";

interface MemoryViewProps {
  isLoading: boolean;
  isSaving: boolean;
  memory: string;
  memoryDraft: string;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export function MemoryView({
  isLoading,
  isSaving,
  memory,
  memoryDraft,
  onDraftChange,
  onSave,
  onReset,
}: MemoryViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading memory...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <Textarea
          value={memoryDraft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="No memory saved yet. Write useful long-term context here."
          className="h-full min-h-[180px] resize-none rounded-xl bg-muted/30 text-sm leading-6"
          maxLength={MAX_MEMORY_LENGTH}
          disabled={isSaving}
        />
      </div>

      <div className="shrink-0 border-t border-border/20 px-6 py-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {memoryDraft.trim().length}/{MAX_MEMORY_LENGTH}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            onClick={onReset}
            disabled={isSaving || memoryDraft === memory}
          >
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full px-4"
            onClick={onSave}
            disabled={isSaving || memoryDraft.trim() === memory}
          >
            {isSaving ? "Saving..." : "Save memory"}
          </Button>
        </div>
      </div>
    </div>
  );
}
