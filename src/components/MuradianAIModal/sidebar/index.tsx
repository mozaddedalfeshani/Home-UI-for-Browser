"use client";

import { SidebarTop } from "./sidebar-top";
import { SidebarBody } from "./sidebar-body";
import { SidebarBottom } from "./sidebar-bottom";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r border-border bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center py-4 transition-all duration-300 ease-in-out">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
          title="Expand Sidebar"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "w-[300px] h-full border-r border-border bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col transition-all duration-300 ease-in-out",
      )}
    >
      <SidebarTop isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <SidebarBody />
      <SidebarBottom />
    </aside>
  );
}
