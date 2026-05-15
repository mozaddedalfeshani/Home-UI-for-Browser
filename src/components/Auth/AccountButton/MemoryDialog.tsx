"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MEMORY_LENGTH } from "./types";

interface MemoryDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  memory: string;
  memoryDraft: string;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export function MemoryDialog({
  isOpen,
  isLoading,
  isSaving,
  memory,
  memoryDraft,
  onOpenChange,
  onDraftChange,
  onSave,
  onReset,
}: MemoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl p-5">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Memory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit what MuradianAsk remembers in normal ask mode.
            </p>
          </div>

          {isLoading ? (
            <div className="min-h-[160px] rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
              Loading memory...
            </div>
          ) : (
            <>
              <Textarea
                value={memoryDraft}
                onChange={(e) => onDraftChange(e.target.value)}
                placeholder="No memory saved yet. You can write useful long-term context here."
                className="min-h-[180px] resize-none rounded-xl bg-muted/30 text-sm leading-6"
                maxLength={MAX_MEMORY_LENGTH}
                disabled={isSaving}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {memoryDraft.trim().length}/{MAX_MEMORY_LENGTH}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={onReset}
                    disabled={isSaving || memoryDraft === memory}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    onClick={onSave}
                    disabled={isSaving || memoryDraft.trim() === memory}
                  >
                    {isSaving ? "Saving..." : "Save memory"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
