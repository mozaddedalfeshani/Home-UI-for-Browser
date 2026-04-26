"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface SidebarTopProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export const SidebarTop = ({ isCollapsed, setIsCollapsed }: SidebarTopProps) => {
  return (
    <div className="p-6 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <HugeiconsIcon icon={SparklesIcon} size={20} />
        </div>
        <h1 className="font-bold text-lg tracking-tight">
          Muradian <span className="text-muted-foreground font-medium">AI</span>
        </h1>
      </div>
      
      <button 
        onClick={() => setIsCollapsed(true)}
        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
        title="Collapse Sidebar"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
      </button>
    </div>
  );
};
