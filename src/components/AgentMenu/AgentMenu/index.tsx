"use client";

import { useEffect, useMemo } from "react";
import {
  Add01Icon,
  BotIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAgentStore } from "@/store/agentStore";
import { useAISidebarStore } from "@/store/aiSidebarStore";
import { cn } from "@/lib/utils";

interface AgentMenuProps {
  onCreateRequested?: () => void;
  onEditRequested?: (agentId: string) => void;
}

export default function AgentMenu({
  onCreateRequested,
  onEditRequested,
}: AgentMenuProps) {
  const agents = useAgentStore((state) => state.agents);
  const ensurePredefinedAgents = useAgentStore(
    (state) => state.ensurePredefinedAgents,
  );
  const activeAgentId = useAISidebarStore((state) => state.activeAgentId);
  const activeAgentName = useAISidebarStore((state) => state.activeAgentName);
  const applyAgentProfile = useAISidebarStore(
    (state) => state.applyAgentProfile,
  );
  const clearActiveAgent = useAISidebarStore((state) => state.clearActiveAgent);
  const clearMessages = useAISidebarStore((state) => state.clearMessages);

  const sortedAgents = useMemo(
    () =>
      [...agents].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [agents],
  );

  useEffect(() => {
    ensurePredefinedAgents();
  }, [ensurePredefinedAgents]);

  const handleAgentSwitch = (agentId: string) => {
    const selectedAgent = agents.find((agent) => agent.id === agentId);

    if (!selectedAgent) {
      toast.error("Agent not found.");
      return;
    }

    applyAgentProfile({
      id: selectedAgent.id,
      name: selectedAgent.name,
      provider: selectedAgent.provider,
      apiKey: selectedAgent.apiKey,
      model: selectedAgent.model,
      rules: selectedAgent.rules,
      language: selectedAgent.language,
      behavior: selectedAgent.behavior,
    });

    toast.success(`Switched to ${selectedAgent.name}.`);
  };

  const handleLeaveAgentMode = () => {
    clearActiveAgent();
    clearMessages();
    toast.success("Left agent mode and cleared chat.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-border/60 bg-background/40 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/80"
            aria-label="Open agents menu"
          >
            <HugeiconsIcon icon={BotIcon} size={16} strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          className="z-[130] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          <DropdownMenuLabel className="px-2 pb-1 pt-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Agents
          </DropdownMenuLabel>

          {sortedAgents.length ? (
            <div className="max-h-72 space-y-1 overflow-y-auto pb-1">
              {sortedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    "group relative rounded-xl border px-3 py-2",
                    activeAgentId === agent.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/50 bg-muted/30",
                  )}
                >
                  <DropdownMenuItem
                    onSelect={() => handleAgentSwitch(agent.id)}
                    className="cursor-pointer rounded-lg p-0 focus:bg-transparent"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                        <HugeiconsIcon
                          icon={BotIcon}
                          size={14}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {agent.name}
                          </p>
                          {activeAgentId === agent.id ? (
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              size={14}
                              strokeWidth={2}
                              className="shrink-0 text-emerald-500"
                            />
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {agent.type === "predefined"
                            ? "Uses global settings"
                            : agent.provider === "openrouter"
                              ? "OpenRouter"
                              : "DeepSeek"}
                          {agent.type !== "predefined" && agent.model
                            ? ` · ${agent.model}`
                            : ""}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  {/* Edit button - only for non-predefined agents */}
                  {agent.type !== "predefined" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRequested?.(agent.id);
                      }}
                      className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      aria-label={`Edit ${agent.name}`}
                    >
                      <HugeiconsIcon
                        icon={PencilEdit01Icon}
                        size={14}
                        strokeWidth={2}
                      />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-center">
              <p className="text-sm font-medium text-foreground">
                No saved agents yet
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Create an agent profile with its own API key, rules, and model.
              </p>
            </div>
          )}

          <DropdownMenuSeparator className="my-2" />

          {activeAgentId ? (
            <>
              <DropdownMenuItem
                onSelect={handleLeaveAgentMode}
                className="rounded-xl px-3 py-2.5 text-amber-600 focus:text-amber-700 dark:text-amber-400 dark:focus:text-amber-300"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
                <span>
                  Leave agent mode
                  {activeAgentName ? ` (${activeAgentName})` : ""}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
            </>
          ) : null}

          <DropdownMenuItem
            onSelect={() => onCreateRequested?.()}
            className="rounded-xl px-3 py-2.5"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
            <span>Create Agent</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            className="rounded-xl px-3 py-2 text-xs text-muted-foreground"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={14}
              strokeWidth={2}
            />
            <span>Tap an agent to switch instantly</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
