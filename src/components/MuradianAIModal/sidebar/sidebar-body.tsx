"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, AiChat02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export const SidebarBody = () => {
  return (
    <>
      <div className="p-4 px-6">
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-medium h-12 shadow-sm">
          <HugeiconsIcon icon={PlusSignIcon} size={18} />
          New Chat
        </Button>
      </div>

      <div className="flex-1 px-4 space-y-1 py-4">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-accent text-accent-foreground shadow-sm"
        >
          <HugeiconsIcon icon={AiChat02Icon} size={20} />
          AI Chatbot
        </button>
      </div>
    </>
  );
};
