"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AiNetworkIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIModelsSectionProps {
  userRole: string;
}

const AI_MODELS = [
  { name: "GPT 5.5", provider: "OpenAI" },
  { name: "Gemini 3.1 Flash", provider: "Google" },
  { name: "DeepSeek V4 Pro", provider: "DeepSeek" },
  { name: "DeepSeek V4 Flash", provider: "DeepSeek" },
];

export function AIModelsSection({ userRole }: AIModelsSectionProps) {
  const isLite = userRole === "lite";

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isLite
          ? "Upgrade to Plus to access multiple AI models."
          : "Multi-model access — coming soon."}
      </p>
      <div className="space-y-2">
        {AI_MODELS.map((model) => (
          <button
            key={model.name}
            type="button"
            onClick={() => isLite && toast.info("Please upgrade to Premium")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm text-foreground transition-colors",
              isLite
                ? "hover:bg-accent cursor-pointer"
                : "cursor-not-allowed opacity-50",
            )}
          >
            <HugeiconsIcon
              icon={AiNetworkIcon}
              size={15}
              strokeWidth={1.5}
              className="text-muted-foreground shrink-0"
            />
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">{model.name}</p>
              <p className="text-xs text-muted-foreground">{model.provider}</p>
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                isLite
                  ? "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                  : "bg-muted/40 text-muted-foreground border border-border/30",
              )}
            >
              {isLite ? "Plus only" : "Soon"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
