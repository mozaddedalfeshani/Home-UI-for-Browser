"use client";

import {
  AiSettingIcon,
  BotIcon,
  Cancel01Icon,
  PencilEdit01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import AgentMenu from "@/components/AgentMenu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AISidebarHeaderProps {
  activeAgentName: string | null;
  providerLabel: string;
  showSetup: boolean;
  isAgentMode: boolean;
  onSettingsOpen: () => void;
  onAgentInfoOpen?: () => void;
  onClose: () => void;
  onAgentCreateRequested: () => void;
  onAgentEditRequested?: (agentId: string) => void;
}

export function AISidebarHeader({
  activeAgentName,
  providerLabel,
  showSetup,
  isAgentMode,
  onSettingsOpen,
  onAgentInfoOpen,
  onClose,
  onAgentCreateRequested,
  onAgentEditRequested,
}: AISidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b px-4 py-4",
        isAgentMode
          ? "border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent"
          : "border-border/50 bg-background/70",
      )}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "rounded-xl border p-2",
            isAgentMode
              ? "border-indigo-400/30 bg-indigo-500/15"
              : "border-primary/15 bg-primary/10",
          )}>
          <HugeiconsIcon
            icon={isAgentMode ? SparklesIcon : BotIcon}
            size={18}
            strokeWidth={2}
            className={cn(isAgentMode ? "text-indigo-400" : "text-primary")}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-tight text-foreground/90">
              {isAgentMode ? activeAgentName : "AI Assistant"}
            </p>
            {isAgentMode ? (
              <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                Agent
              </span>
            ) : (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                Beta
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {activeAgentName && !isAgentMode
              ? `${activeAgentName} · ${providerLabel}`
              : providerLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <AgentMenu
          onCreateRequested={onAgentCreateRequested}
          onEditRequested={onAgentEditRequested}
        />
        {!showSetup ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={isAgentMode ? onAgentInfoOpen : onSettingsOpen}
            className="h-8 w-8 rounded-full"
            aria-label={isAgentMode ? "Edit agent" : "Open AI settings"}>
            <HugeiconsIcon
              icon={isAgentMode ? PencilEdit01Icon : AiSettingIcon}
              size={18}
              strokeWidth={2}
            />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="h-8 w-8 rounded-full"
          aria-label="Close AI sidebar">
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
