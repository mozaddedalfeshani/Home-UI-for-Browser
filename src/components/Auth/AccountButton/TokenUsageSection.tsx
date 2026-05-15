"use client";

import { cn } from "@/lib/utils";
import type { TokenInfo } from "./types";

export function TokenUsageSection({ tokenInfo }: { tokenInfo: TokenInfo }) {
  if (tokenInfo.tokenLimit === null) return null;
  const pct = tokenInfo.tokensUsed / tokenInfo.tokenLimit;
  const remaining = Math.max(tokenInfo.tokenLimit - tokenInfo.tokensUsed, 0);

  return (
    <div className="px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          AI tokens (10h window)
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums",
            pct >= 0.9
              ? "text-destructive"
              : pct >= 0.7
                ? "text-amber-500"
                : "text-foreground",
          )}
        >
          {tokenInfo.tokensUsed.toLocaleString()} /{" "}
          {tokenInfo.tokenLimit.toLocaleString()}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 0.9
              ? "bg-destructive"
              : pct >= 0.7
                ? "bg-amber-500"
                : "bg-primary",
          )}
          style={{ width: `${Math.min(pct * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        {remaining.toLocaleString()} remaining
        {tokenInfo.resetAt
          ? ` · resets ${new Date(tokenInfo.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : ""}
      </p>
    </div>
  );
}
