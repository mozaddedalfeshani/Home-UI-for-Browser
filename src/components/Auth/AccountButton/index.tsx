"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import dynamic from "next/dynamic";
const AuthDialog = dynamic(
  () => import("../AuthDialog").then((mod) => mod.AuthDialog),
  {
    ssr: false,
  },
);
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface MemoryResponse {
  memory?: string;
  error?: string;
}

const MAX_MEMORY_LENGTH = 200;

export function AccountButton() {
  const { user, isAuthenticated, logout, pushSync, pullSync, lastSynced } =
    useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [isMemorySaving, setIsMemorySaving] = useState(false);
  const [memory, setMemory] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");

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
    // pullSync(true) instantly replaces local tabs and settings
    await pullSync(true);
    setIsSyncing(false);
  };

  const handleOpenMemory = async () => {
    setIsMemoryOpen(true);
    setIsMemoryLoading(true);

    try {
      const response = await fetch("/api/ai/memory");
      const data = (await response.json().catch(() => ({}))) as MemoryResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to load memory");
      }

      const nextMemory = data.memory?.trim() ?? "";
      setMemory(nextMemory);
      setMemoryDraft(nextMemory);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load memory";
      toast.error(message);
      setMemory("");
      setMemoryDraft("");
    } finally {
      setIsMemoryLoading(false);
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to save memory");
      }

      const savedMemory = data.memory?.trim() ?? "";
      setMemory(savedMemory);
      setMemoryDraft(savedMemory);
      toast.success("Memory updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save memory";
      toast.error(message);
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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsPushConfirmOpen(true)}
            disabled={isSyncing}
          >
            <HugeiconsIcon icon={CloudUploadIcon} size={16} className="mr-2" />
            <span>Push local to cloud</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePull} disabled={isSyncing}>
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              className={`mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>Pull from cloud</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenMemory}>
            <HugeiconsIcon icon={AiBrain01Icon} size={16} className="mr-2" />
            <span>Memory</span>
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

      <ConfirmDialog
        open={isPushConfirmOpen}
        onOpenChange={setIsPushConfirmOpen}
        title="Sync to Cloud?"
        description="This will overwrite your cloud data with your current local tabs and settings. Are you sure?"
        confirmText="Yes, Sync Now"
        variant="warning"
        onConfirm={handlePushConfirm}
      />

      <Dialog open={isMemoryOpen} onOpenChange={setIsMemoryOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Memory
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit what MuradianAsk remembers in normal ask mode.
              </p>
            </div>
            {isMemoryLoading ? (
              <div className="min-h-[160px] rounded-xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                Loading memory...
              </div>
            ) : (
              <>
                <Textarea
                  value={memoryDraft}
                  onChange={(event) => setMemoryDraft(event.target.value)}
                  placeholder="No memory saved yet. You can write useful long-term context here."
                  className="min-h-[180px] resize-none rounded-xl bg-muted/30 text-sm leading-6"
                  maxLength={MAX_MEMORY_LENGTH}
                  disabled={isMemorySaving}
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
                      onClick={() => setMemoryDraft(memory)}
                      disabled={isMemorySaving || memoryDraft === memory}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-full"
                      onClick={handleSaveMemory}
                      disabled={isMemorySaving || memoryDraft.trim() === memory}
                    >
                      {isMemorySaving ? "Saving..." : "Save memory"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
