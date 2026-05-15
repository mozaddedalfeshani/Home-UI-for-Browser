"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MEMORY_LENGTH, MAX_NAME_LENGTH } from "./types";

interface ProfileDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  profileName: string;
  profileMemory: string;
  currentPassword: string;
  newPassword: string;
  onOpenChange: (open: boolean) => void;
  onNameChange: (v: string) => void;
  onMemoryChange: (v: string) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onSave: () => void;
}

export function ProfileDialog({
  isOpen,
  isLoading,
  isSaving,
  profileName,
  profileMemory,
  currentPassword,
  newPassword,
  onOpenChange,
  onNameChange,
  onMemoryChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSave,
}: ProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl p-5">
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your name, MuradianAsk memory, and password.
            </p>
          </div>

          {isLoading ? (
            <div className="min-h-[220px] rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
              Loading profile...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Display name</p>
                <Input
                  value={profileName}
                  onChange={(e) => onNameChange(e.target.value)}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Your name"
                  disabled={isSaving}
                  className="rounded-xl bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Memory</p>
                <Textarea
                  value={profileMemory}
                  onChange={(e) => onMemoryChange(e.target.value)}
                  placeholder="What should MuradianAsk remember?"
                  className="min-h-[120px] resize-none rounded-xl bg-muted/30 text-sm leading-6"
                  maxLength={MAX_MEMORY_LENGTH}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  {profileMemory.trim().length}/{MAX_MEMORY_LENGTH}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Current password</p>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => onCurrentPasswordChange(e.target.value)}
                    placeholder="Required to change password"
                    disabled={isSaving}
                    className="rounded-xl bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">New password</p>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => onNewPasswordChange(e.target.value)}
                    placeholder="Leave blank to keep current"
                    disabled={isSaving}
                    className="rounded-xl bg-muted/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
