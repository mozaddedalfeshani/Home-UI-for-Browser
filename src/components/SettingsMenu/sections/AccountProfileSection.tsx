"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import {
  MAX_MEMORY_LENGTH,
  MAX_NAME_LENGTH,
} from "@/components/Auth/AccountButton/types";
import type { ProfileResponse } from "@/components/Auth/AccountButton/types";

export function AccountProfileSection() {
  const { user, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileMemory, setProfileMemory] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setProfileName(user?.name ?? "");
    fetch("/api/auth/profile")
      .then((r) => r.json() as Promise<ProfileResponse>)
      .then((data) => {
        setProfileName(data.user?.name?.trim() ?? user?.name ?? "");
        setProfileMemory(data.memory?.trim() ?? "");
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to load profile",
        );
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const nextName = profileName.trim();
    const nextMemory = profileMemory.trim();
    if (!nextName) {
      toast.error("Name is required.");
      return;
    }
    if (nextName.length > MAX_NAME_LENGTH) {
      toast.error(`Name max ${MAX_NAME_LENGTH} chars.`);
      return;
    }
    if (nextMemory.length > MAX_MEMORY_LENGTH) {
      toast.error(`Memory max ${MAX_MEMORY_LENGTH} chars.`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          memory: nextMemory,
          currentPassword,
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ProfileResponse;
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.user) setUser(data.user);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Display name
          </p>
          <Input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
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
            onChange={(e) => setProfileMemory(e.target.value)}
            placeholder="What should MuradianAsk remember?"
            className="min-h-[80px] resize-none rounded-xl bg-muted/30 text-sm max-w-sm"
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
          <div className="grid gap-2 sm:grid-cols-2 max-w-sm">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              disabled={isSaving}
              className="rounded-xl bg-muted/30"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              disabled={isSaving}
              className="rounded-xl bg-muted/30"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="rounded-full px-5"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
