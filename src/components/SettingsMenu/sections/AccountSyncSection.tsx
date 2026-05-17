"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  RefreshIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/store/authStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TokenUsageSection } from "@/components/Auth/AccountButton/TokenUsageSection";
import { SectionLabel } from "../shared/SectionLabel";
import type { TokenInfo } from "@/components/Auth/AccountButton/types";

export function AccountSyncSection() {
  const { pushSync, pullSync, lastSynced } = useAuthStore();

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushConfirmOpen, setIsPushConfirmOpen] = useState(false);

  useEffect(() => {
    fetch("/api/ai/usage")
      .then((r) => (r.ok ? (r.json() as Promise<TokenInfo>) : null))
      .then((d) => {
        if (d) setTokenInfo(d);
      })
      .catch(() => {});
  }, []);

  const handlePushConfirm = async () => {
    setIsSyncing(true);
    try {
      await pushSync();
      toast.success("Data synced to cloud");
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async () => {
    setIsSyncing(true);
    await pullSync(true);
    setIsSyncing(false);
  };

  const SYNC_ACTIONS = [
    {
      icon: CloudUploadIcon,
      title: "Push local to cloud",
      desc: "Overwrite cloud with current local data",
      onClick: () => setIsPushConfirmOpen(true),
    },
    {
      icon: RefreshIcon,
      title: "Pull from cloud",
      desc: "Replace local data with cloud version",
      onClick: handlePull,
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {tokenInfo && (
          <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
            <TokenUsageSection tokenInfo={tokenInfo} />
          </div>
        )}
        <div className="space-y-2">
          <SectionLabel>Sync data</SectionLabel>
          {SYNC_ACTIONS.map((item) => (
            <button
              key={item.title}
              onClick={item.onClick}
              disabled={isSyncing}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-muted/10 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <HugeiconsIcon
                icon={item.icon}
                size={16}
                strokeWidth={1.5}
                className="text-muted-foreground shrink-0"
              />
              <div className="flex-1 text-left">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          ))}
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

      <ConfirmDialog
        open={isPushConfirmOpen}
        onOpenChange={setIsPushConfirmOpen}
        title="Sync to Cloud?"
        description="This will overwrite your cloud data with current local tabs and settings."
        confirmText="Yes, Sync Now"
        variant="warning"
        onConfirm={handlePushConfirm}
      />
    </>
  );
}
