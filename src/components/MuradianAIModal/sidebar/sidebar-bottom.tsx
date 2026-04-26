"use client";

import { useAuthStore } from "@/store/authStore";
import { useMuradianAiStore } from "@/store/muradianAiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";

export const SidebarBottom = () => {
  const { user, logout } = useAuthStore();
  const { setActiveView } = useMuradianAiStore();

  if (!user) return null;

  return (
    <div className="px-4 py-4 border-t border-border mt-auto">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full text-left outline-none">
          <div className="flex items-center gap-2.5 px-1 hover:bg-accent/50 p-2 rounded-lg transition-colors cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base uppercase">
                {user.name ? user.name[0] : user.email[0]}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground leading-tight truncate capitalize">
                {user.name || "User"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 mb-2">
          <DropdownMenuItem onClick={() => setActiveView("settings")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings & Usage</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

