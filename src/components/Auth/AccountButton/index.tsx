"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Logout01Icon,
  CloudUploadIcon,
  RefreshIcon,
  Tick01Icon,
  AiBrain01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TokenUsageSection } from "./TokenUsageSection";
import { ProfileDialog } from "./ProfileDialog";
import { MemoryDialog } from "./MemoryDialog";
import {
  type MemoryResponse,
  type ProfileResponse,
  type TokenInfo,
  MAX_MEMORY_LENGTH,
  MAX_NAME_LENGTH,
} from "./types";

const AuthDialog = dynamic(
  () => import("../AuthDialog").then((mod) => mod.AuthDialog),
  { ssr: false },
);

export function AccountButton() {
  const { user, isAuthenticated, logout, pushSync, pullSync, lastSynced, setUser } = useAuthStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileMemory, setProfileMemory] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [isMemorySaving, setIsMemorySaving] = useState(false);
  const [memory, setMemory] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");

  const handleDropdownOpen = (open: boolean) => {
    if (!open || !isAuthenticated) return;
    fetch("/api/ai/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: TokenInfo | null) => { if (data) setTokenInfo(data); })
      .catch(() => {});
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  const handlePushConfirm = async () => {
    setIsSyncing(true);
    await pushSync();
    setIsSyncing(false);
    toast.success("Data synced to cloud");
  };

  const handlePull = async () => {
    setIsSyncing(true);
    await pullSync(true);
    setIsSyncing(false);
  };

  const handleOpenMemory = async () => {
    setIsMemoryOpen(true);
    setIsMemoryLoading(true);
    try {
      const response = await fetch("/api/ai/memory");
      const data = (await response.json().catch(() => ({}))) as MemoryResponse;
      if (!response.ok) throw new Error(data.error || "Failed to load memory");
      const nextMemory = data.memory?.trim() ?? "";
      setMemory(nextMemory);
      setMemoryDraft(nextMemory);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load memory");
      setMemory("");
      setMemoryDraft("");
    } finally {
      setIsMemoryLoading(false);
    }
  };

  const handleOpenProfile = async () => {
    setIsProfileOpen(true);
    setIsProfileLoading(true);
    setProfileName(user?.name ?? "");
    setProfileMemory("");
    setCurrentPassword("");
    setNewPassword("");
    try {
      const response = await fetch("/api/auth/profile");
      const data = (await response.json().catch(() => ({}))) as ProfileResponse;
      if (!response.ok) throw new Error(data.error || "Failed to load profile");
      setProfileName(data.user?.name?.trim() ?? user?.name ?? "");
      setProfileMemory(data.memory?.trim() ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    const nextName = profileName.trim();
    const nextMemory = profileMemory.trim();
    if (!nextName) { toast.error("Name is required."); return; }
    if (nextName.length > MAX_NAME_LENGTH) { toast.error(`Name must be ${MAX_NAME_LENGTH} characters or less.`); return; }
    if (nextMemory.length > MAX_MEMORY_LENGTH) { toast.error(`Memory must be ${MAX_MEMORY_LENGTH} characters or less.`); return; }

    setIsProfileSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, memory: nextMemory, currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as ProfileResponse;
      if (!response.ok) throw new Error(data.error || "Failed to update profile");
      if (data.user) setUser(data.user);
      setMemory(nextMemory);
      setMemoryDraft(nextMemory);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleSaveMemory = async () => {
    const nextMemory = memoryDraft.trim();
    if (nextMemory.length > MAX_MEMORY_LENGTH) { toast.error(`Memory must be ${MAX_MEMORY_LENGTH} characters or less.`); return; }

    setIsMemorySaving(true);
    try {
      const response = await fetch("/api/ai/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory: nextMemory }),
      });
      const data = (await response.json().catch(() => ({}))) as MemoryResponse;
      if (!response.ok) throw new Error(data.error || "Failed to save memory");
      const savedMemory = data.memory?.trim() ?? "";
      setMemory(savedMemory);
      setMemoryDraft(savedMemory);
      toast.success("Memory updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save memory");
    } finally {
      setIsMemorySaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setIsAuthOpen(true)} className="gap-2 rounded-full px-4">
          <HugeiconsIcon icon={UserIcon} size={16} />
          <span>Login / Sync</span>
        </Button>
        <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </>
    );
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu onOpenChange={handleDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Account</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>

          {tokenInfo && (
            <>
              <DropdownMenuSeparator />
              <TokenUsageSection tokenInfo={tokenInfo} />
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsPushConfirmOpen(true)} disabled={isSyncing}>
            <HugeiconsIcon icon={CloudUploadIcon} size={16} className="mr-2" />
            <span>Push local to cloud</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePull} disabled={isSyncing}>
            <HugeiconsIcon icon={RefreshIcon} size={16} className={`mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Pull from cloud</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenProfile}>
            <HugeiconsIcon icon={UserIcon} size={16} className="mr-2" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenMemory}>
            <HugeiconsIcon icon={AiBrain01Icon} size={16} className="mr-2" />
            <span>Memory</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogout}>
            <HugeiconsIcon icon={Logout01Icon} size={16} className="mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={isPushConfirmOpen}
        onOpenChange={setIsPushConfirmOpen}
        title="Sync to Cloud?"
        description="This will overwrite your cloud data with your current local tabs and settings. Are you sure?"
        confirmText="Yes, Sync Now"
        variant="warning"
        onConfirm={handlePushConfirm}
      />

      <ProfileDialog
        isOpen={isProfileOpen}
        isLoading={isProfileLoading}
        isSaving={isProfileSaving}
        profileName={profileName}
        profileMemory={profileMemory}
        currentPassword={currentPassword}
        newPassword={newPassword}
        onOpenChange={setIsProfileOpen}
        onNameChange={setProfileName}
        onMemoryChange={setProfileMemory}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onSave={handleSaveProfile}
      />

      <MemoryDialog
        isOpen={isMemoryOpen}
        isLoading={isMemoryLoading}
        isSaving={isMemorySaving}
        memory={memory}
        memoryDraft={memoryDraft}
        onOpenChange={setIsMemoryOpen}
        onDraftChange={setMemoryDraft}
        onSave={handleSaveMemory}
        onReset={() => setMemoryDraft(memory)}
      />

      {lastSynced && (
        <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
          <HugeiconsIcon icon={Tick01Icon} size={12} className="text-green-500" />
          <span>Synced</span>
        </div>
      )}
    </div>
  );
}
