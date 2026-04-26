"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export const SidebarTop = () => {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg">
          <HugeiconsIcon icon={AiMagicIcon} size={20} className="text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">
          Muradian <span className="text-muted-foreground font-normal">AI</span>
        </span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
      </Button>
    </div>
  );
};
