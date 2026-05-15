"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MEMORY_LENGTH, MAX_NAME_LENGTH } from "./types";

interface ProfileViewProps {
  isLoading: boolean;
  isSaving: boolean;
  profileName: string;
  profileMemory: string;
  currentPassword: string;
  newPassword: string;
  onNameChange: (v: string) => void;
  onMemoryChange: (v: string) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onSave: () => void;
}

export function ProfileView({
  isLoading,
  isSaving,
  profileName,
  profileMemory,
  currentPassword,
  newPassword,
  onNameChange,
  onMemoryChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSave,
}: ProfileViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Display name
          </p>
          <Input
            value={profileName}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Your name"
            disabled={isSaving}
            className="rounded-xl bg-muted/30 max-w-sm"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            MuradianAsk memory
          </p>
          <Textarea
            value={profileMemory}
            onChange={(e) => onMemoryChange(e.target.value)}
            placeholder="What should MuradianAsk remember about you?"
            className="min-h-[100px] resize-none rounded-xl bg-muted/30 text-sm leading-6 max-w-sm"
            maxLength={MAX_MEMORY_LENGTH}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            {profileMemory.trim().length}/{MAX_MEMORY_LENGTH}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Change password
          </p>
          <div className="grid gap-3 sm:grid-cols-2 max-w-sm">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="Current password"
              disabled={isSaving}
              className="rounded-xl bg-muted/30"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="New password"
              disabled={isSaving}
              className="rounded-xl bg-muted/30"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border/20 px-6 py-3 flex justify-end">
        <Button
          type="button"
          size="sm"
          className="rounded-full px-5"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
