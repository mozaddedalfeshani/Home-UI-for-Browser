"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TokenUsageSection } from "./TokenUsageSection";
import { ProfileView } from "./ProfileView";
import { MemoryView } from "./MemoryView";
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

type AccountSection = "profile" | "memory" | "sync";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export function AccountButton() {
  const {
    user,
    isAuthenticated,
    logout,
    pushSync,
    pullSync,
    lastSynced,
    setUser,
  } = useAuthStore();
  const isDesktop = useIsDesktop();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [section, setSection] = useState<AccountSection>("profile");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileMemory, setProfileMemory] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [isMemorySaving, setIsMemorySaving] = useState(false);
  const [memory, setMemory] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");

  const loadProfile = async () => {
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
      toast.error(
        error instanceof Error ? error.message : "Failed to load profile",
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

  const loadMemory = async () => {
    setIsMemoryLoading(true);
    try {
      const response = await fetch("/api/ai/memory");
      const data = (await response.json().catch(() => ({}))) as MemoryResponse;
      if (!response.ok) throw new Error(data.error || "Failed to load memory");
      const nextMemory = data.memory?.trim() ?? "";
      setMemory(nextMemory);
      setMemoryDraft(nextMemory);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load memory",
      );
      setMemory("");
      setMemoryDraft("");
    } finally {
      setIsMemoryLoading(false);
    }
  };

  const openDialog = (s: AccountSection = "profile") => {
    setSection(s);
    setIsDialogOpen(true);
    fetch("/api/ai/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: TokenInfo | null) => {
        if (data) setTokenInfo(data);
      })
      .catch(() => {});
    if (s === "profile" || s === "sync") void loadProfile();
    if (s === "memory") void loadMemory();
  };

  const handleAvatarClick = () => {
    if (isDesktop) openDialog("profile");
  };

  const handleSectionChange = (next: AccountSection) => {
    setSection(next);
    if (next === "memory" && !isMemoryLoading && !memory && !memoryDraft) {
      void loadMemory();
    }
    if (next === "profile" && !isProfileLoading && !profileName) {
      void loadProfile();
    }
  };

  const handleLogout = async () => {
    setIsDialogOpen(false);
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

  const handleSaveProfile = async () => {
    const nextName = profileName.trim();
    const nextMemory = profileMemory.trim();
    if (!nextName) {
      toast.error("Name is required.");
      return;
    }
    if (nextName.length > MAX_NAME_LENGTH) {
      toast.error(`Name must be ${MAX_NAME_LENGTH} characters or less.`);
      return;
    }
    if (nextMemory.length > MAX_MEMORY_LENGTH) {
      toast.error(`Memory must be ${MAX_MEMORY_LENGTH} characters or less.`);
      return;
    }

    setIsProfileSaving(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          memory: nextMemory,
          currentPassword,
          newPassword,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as ProfileResponse;
      if (!response.ok)
        throw new Error(data.error || "Failed to update profile");
      if (data.user) setUser(data.user);
      setMemory(nextMemory);
      setMemoryDraft(nextMemory);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleSaveMemory = async () => {
    const nextMemory = memoryDraft.trim();
    if (nextMemory.length > MAX_MEMORY_LENGTH) {
      toast.error(`Memory must be ${MAX_MEMORY_LENGTH} characters or less.`);
      return;
    }

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
      toast.error(
        error instanceof Error ? error.message : "Failed to save memory",
      );
    } finally {
      setIsMemorySaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAuthOpen(true)}
          className="gap-2 rounded-full px-4"
        >
          <HugeiconsIcon icon={UserIcon} size={16} />
          <span>Login / Sync</span>
        </Button>
        <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </>
    );
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || "??";

  const avatarButton = (
    <Button
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
      onClick={handleAvatarClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Mobile: dropdown popover */}
      {!isDesktop ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{avatarButton}</DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Account"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDialog("profile")}>
              <HugeiconsIcon icon={UserIcon} size={16} className="mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("memory")}>
              <HugeiconsIcon icon={AiBrain01Icon} size={16} className="mr-2" />
              <span>Memory</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("sync")}>
              <HugeiconsIcon
                icon={CloudUploadIcon}
                size={16}
                className="mr-2"
              />
              <span>Cloud Sync</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={handleLogout}
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} className="mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        avatarButton
      )}

      {/* Settings Dialog (desktop: VSCode-style, mobile: compact) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          hideDefaultClose
          className="p-0 overflow-hidden rounded-2xl w-full max-w-[95vw] h-[85vh] sm:max-w-3xl sm:h-[520px]"
        >
          <DialogTitle className="sr-only">Account settings</DialogTitle>

          <div className="flex h-full">
            {/* Left sidebar */}
            <div className="flex flex-col w-48 shrink-0 border-r border-border/20 bg-muted/20">
              <div className="px-4 py-4 border-b border-border/20">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.name || "Account"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 py-2">
                {(["profile", "memory", "sync"] as AccountSection[]).map(
                  (id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSectionChange(id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                        section === id
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {id === "profile" && (
                        <HugeiconsIcon
                          icon={UserIcon}
                          size={14}
                          className="shrink-0"
                        />
                      )}
                      {id === "memory" && (
                        <HugeiconsIcon
                          icon={AiBrain01Icon}
                          size={14}
                          className="shrink-0"
                        />
                      )}
                      {id === "sync" && (
                        <HugeiconsIcon
                          icon={CloudUploadIcon}
                          size={14}
                          className="shrink-0"
                        />
                      )}
                      {id === "profile"
                        ? "Profile"
                        : id === "memory"
                          ? "Memory"
                          : "Cloud Sync"}
                    </button>
                  ),
                )}
              </nav>

              <div className="border-t border-border/20 p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-accent transition-colors"
                >
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    size={14}
                    className="shrink-0"
                  />
                  Log out
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center px-6 py-3.5 border-b border-border/20 shrink-0">
                <h2 className="text-sm font-semibold text-foreground">
                  {section === "profile" && "Profile"}
                  {section === "memory" && "Memory"}
                  {section === "sync" && "Cloud Sync"}
                </h2>
              </div>

              {section === "profile" && (
                <ProfileView
                  isLoading={isProfileLoading}
                  isSaving={isProfileSaving}
                  profileName={profileName}
                  profileMemory={profileMemory}
                  currentPassword={currentPassword}
                  newPassword={newPassword}
                  onNameChange={setProfileName}
                  onMemoryChange={setProfileMemory}
                  onCurrentPasswordChange={setCurrentPassword}
                  onNewPasswordChange={setNewPassword}
                  onSave={handleSaveProfile}
                />
              )}

              {section === "memory" && (
                <MemoryView
                  isLoading={isMemoryLoading}
                  isSaving={isMemorySaving}
                  memory={memory}
                  memoryDraft={memoryDraft}
                  onDraftChange={setMemoryDraft}
                  onSave={handleSaveMemory}
                  onReset={() => setMemoryDraft(memory)}
                />
              )}

              {section === "sync" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
                    {tokenInfo && (
                      <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
                        <TokenUsageSection tokenInfo={tokenInfo} />
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Sync data
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsPushConfirmOpen(true)}
                        disabled={isSyncing}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-muted/10 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <HugeiconsIcon
                          icon={CloudUploadIcon}
                          size={16}
                          className="text-muted-foreground shrink-0"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Push local to cloud</p>
                          <p className="text-xs text-muted-foreground">
                            Overwrite cloud with current local data
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={handlePull}
                        disabled={isSyncing}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-muted/10 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <HugeiconsIcon
                          icon={RefreshIcon}
                          size={16}
                          className={`text-muted-foreground shrink-0 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium">Pull from cloud</p>
                          <p className="text-xs text-muted-foreground">
                            Replace local data with cloud version
                          </p>
                        </div>
                      </button>
                    </div>

                    {lastSynced && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <HugeiconsIcon
                          icon={Tick01Icon}
                          size={12}
                          className="text-green-500"
                        />
                        Last synced{" "}
                        {new Date(lastSynced).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isPushConfirmOpen}
        onOpenChange={setIsPushConfirmOpen}
        title="Sync to Cloud?"
        description="This will overwrite your cloud data with your current local tabs and settings. Are you sure?"
        confirmText="Yes, Sync Now"
        variant="warning"
        onConfirm={handlePushConfirm}
      />

      {lastSynced && (
        <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
          <HugeiconsIcon
            icon={Tick01Icon}
            size={12}
            className="text-green-500"
          />
          <span>Synced</span>
        </div>
      )}
    </div>
  );
}
