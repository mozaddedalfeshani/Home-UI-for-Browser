"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Alert01Icon } from "@hugeicons/core-free-icons";

export function PullPrompt({ onComplete }: { onComplete: () => void }) {
  const { pullSync } = useAuthStore();

  const handlePull = async () => {
    await pullSync(true);
    onComplete();
  };

  return (
    <div className="space-y-6 pt-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <HugeiconsIcon
            icon={Alert01Icon}
            size={32}
            className="text-amber-500"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Sync from Cloud?
          </h3>
          <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
            We found synced data in your account. Do you want to pull it now?
          </p>
        </div>
      </div>

      <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3">
        <p className="text-[11px] text-destructive font-medium uppercase tracking-wider">
          Warning
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This will replace all your current local tabs and settings with the
          ones from your cloud account.
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={handlePull}
          className="w-full h-11 rounded-full bg-primary font-bold shadow-lg shadow-primary/20"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} className="mr-2" />
          Yes, Pull from Cloud
        </Button>
        <Button
          variant="ghost"
          onClick={onComplete}
          className="w-full h-11 rounded-full font-semibold"
        >
          No, keep local for now
        </Button>
      </div>
    </div>
  );
}
