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
import {
  User,
  LogOut,
  CloudUpload,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function AccountButton() {
  const { user, isAuthenticated, logout, pushSync, pullSync, lastSynced } =
    useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  const handleSync = async () => {
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

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAuthOpen(true)}
          className="gap-2 rounded-full px-4"
        >
          <User className="h-4 w-4" />
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
          <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
            <CloudUpload className="mr-2 h-4 w-4" />
            <span>Push local to cloud</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePull} disabled={isSyncing}>
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span>Pull from cloud</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {lastSynced && (
        <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
          <ShieldCheck className="h-3 w-3 text-green-500" />
          <span>Synced</span>
        </div>
      )}
    </div>
  );
}
