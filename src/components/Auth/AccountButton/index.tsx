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
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function AccountButton() {
  const { user, isAuthenticated, logout, pushSync, pullSync, lastSynced } =
    useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);

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
