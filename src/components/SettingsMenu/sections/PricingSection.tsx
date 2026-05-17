"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Crown02Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  userRole: string;
}

const FREE_FEATURES = [
  "Tab shortcuts",
  "Sticky notes",
  "Search history",
  "Wallpaper gallery",
  "Clock widget",
];

const LITE_FEATURES = [
  "700,000 tokens / 5 hours",
  "MuradianAsk AI",
  "Notes",
  "Tab list",
  "Settings cloud sync",
];

const PLUS_FEATURES = [
  "Unlimited tokens",
  "MuradianAsk AI",
  "Notes",
  "Tab list",
  "Settings cloud sync",
  "AI chat history",
  "GPT 5.5",
  "Gemini 3.1 Flash",
  "DeepSeek V4 Pro / Flash",
];

function FeatureList({
  features,
  iconClass,
}: {
  features: string[];
  iconClass: string;
}) {
  return (
    <ul className="flex flex-col gap-1.5 flex-1">
      {features.map((f, i) => (
        <li
          key={f}
          className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-0 animate-[fadeSlideIn_0.3s_ease_forwards]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <HugeiconsIcon
            icon={Tick01Icon}
            size={11}
            className={cn("shrink-0", iconClass)}
          />
          {f}
        </li>
      ))}
    </ul>
  );
}

export function PricingSection({ userRole }: PricingSectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a plan that fits your needs.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {/* Free */}
        <div
          className={cn(
            "flex flex-col rounded-2xl border p-5 gap-3 relative overflow-hidden",
            userRole === "free"
              ? "border-border bg-muted/20"
              : "border-border/50 bg-muted/10",
          )}
        >
          {userRole === "free" && (
            <div className="absolute top-2 right-2 rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Active
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Crown02Icon}
                size={18}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
              <span className="text-sm font-semibold text-foreground">
                Free
              </span>
            </div>
            <span className="text-base font-bold text-foreground">
              ৳0
              <span className="text-xs font-normal text-muted-foreground">
                /mo
              </span>
            </span>
          </div>
          <FeatureList
            features={FREE_FEATURES}
            iconClass="text-muted-foreground/60"
          />
          <div className="w-full rounded-xl bg-muted/30 border border-border/30 py-2 text-center text-xs font-semibold text-muted-foreground">
            {userRole === "free" ? "Current Plan" : "Free"}
          </div>
        </div>

        {/* Lite */}
        <div
          className={cn(
            "flex flex-col rounded-2xl border p-5 gap-3 relative overflow-hidden",
            userRole === "lite"
              ? "border-amber-400/60 bg-amber-400/5"
              : "border-border/50 bg-muted/10",
          )}
        >
          {userRole === "lite" && (
            <div className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
              Active
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Crown02Icon}
                size={18}
                strokeWidth={1.5}
                className="text-amber-400"
              />
              <span className="text-sm font-semibold text-foreground">
                Lite
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base font-bold text-foreground">
                    ৳50
                    <span className="text-xs font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>50 Taka per month</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FeatureList features={LITE_FEATURES} iconClass="text-amber-400" />
          <button
            disabled
            className="w-full rounded-xl bg-amber-400/10 border border-amber-400/30 py-2 text-xs font-semibold text-amber-500 opacity-60 cursor-not-allowed"
          >
            {userRole === "lite" ? "Current Plan" : "Coming Soon"}
          </button>
        </div>

        {/* Plus */}
        <div
          className={cn(
            "flex flex-col rounded-2xl border p-5 gap-3 relative overflow-hidden",
            userRole === "plus"
              ? "border-violet-500/60 bg-violet-500/5"
              : "border-primary/30 bg-primary/5",
          )}
        >
          <div className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
            {userRole === "plus" ? "Active" : "Best"}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={Crown02Icon}
                size={18}
                strokeWidth={1.5}
                className="text-primary"
              />
              <span className="text-sm font-semibold text-foreground">
                Plus
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-base font-bold text-foreground">
                    ৳299
                    <span className="text-xs font-normal text-muted-foreground">
                      /mo
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>299 Taka per month</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FeatureList features={PLUS_FEATURES} iconClass="text-primary" />
          <button
            disabled
            className="w-full rounded-xl bg-primary/10 border border-primary/30 py-2 text-xs font-semibold text-primary opacity-60 cursor-not-allowed"
          >
            {userRole === "plus" ? "Current Plan" : "Coming Soon"}
          </button>
        </div>
      </div>
    </div>
  );
}
