"use client";

import { cn } from "@/lib/utils";
import type { TokenUsage } from "../types";

function formatTimeUntil(resetAt: string): string {
  if (!resetAt) return "";
  const ms = new Date(resetAt).getTime() - Date.now();
  if (ms <= 0) return "soon";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function TokenUsageBar({ usage }: { usage: TokenUsage }) {
  const pct = Math.min((usage.tokensUsed / usage.tokenLimit) * 100, 100);
  const remaining = Math.max(usage.tokenLimit - usage.tokensUsed, 0);
  const isWarning = pct >= 70;
  const isDanger = pct >= 90;

  return (
    <div className="mt-1.5 px-1">
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-[10px] font-medium tabular-nums",
            isDanger
              ? "text-destructive"
              : isWarning
                ? "text-amber-500"
                : "text-muted-foreground/60",
          )}
        >
          {usage.tokensUsed.toLocaleString()} / {usage.tokenLimit.toLocaleString()} tokens
        </span>
        {remaining === 0 ? (
          <span className="text-[10px] text-destructive">
            resets in {formatTimeUntil(usage.resetAt)}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">
            {remaining.toLocaleString()} left · resets in {formatTimeUntil(usage.resetAt)}
          </span>
        )}
      </div>
      <div className="h-0.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isDanger ? "bg-destructive" : isWarning ? "bg-amber-500" : "bg-primary/50",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
