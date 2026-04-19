"use client";

import { AiSettingIcon, BotIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import AgentMenu from "@/components/AgentMenu";
import { Button } from "@/components/ui/button";

interface AISidebarHeaderProps {
  activeAgentName: string | null;
  providerLabel: string;
  showSetup: boolean;
  onSettingsOpen: () => void;
  onClose: () => void;
  onAgentCreateRequested: () => void;
}

export function AISidebarHeader({
  activeAgentName,
  providerLabel,
  showSetup,
  onSettingsOpen,
  onClose,
  onAgentCreateRequested,
}: AISidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="rounded-xl border border-primary/15 bg-primary/10 p-2">
          <HugeiconsIcon icon={BotIcon} size={18} strokeWidth={2} className="text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold uppercase tracking-tight text-foreground/90">
              AI Assistant
            </p>
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
              Beta
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {activeAgentName ? `${activeAgentName} · ${providerLabel}` : providerLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <AgentMenu onCreateRequested={onAgentCreateRequested} />
        {!showSetup ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onSettingsOpen}
            className="h-8 w-8 rounded-full"
            aria-label="Open AI settings">
            <HugeiconsIcon icon={AiSettingIcon} size={18} strokeWidth={2} />
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
