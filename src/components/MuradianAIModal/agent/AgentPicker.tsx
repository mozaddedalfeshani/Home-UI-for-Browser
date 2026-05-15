"use client";

import {
  Bot,
  Check,
  ChevronDown,
  Globe2,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiChipIcon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  MuradianAskAgent,
  MuradianAskAgentId,
} from "@/store/muradianAskAgentStore";

interface AgentPickerProps {
  selectedAgent: MuradianAskAgent | undefined;
  selectedAgentId: MuradianAskAgentId;
  filteredAgents: MuradianAskAgent[];
  filteredPublicAgents: MuradianAskAgent[];
  agentSearch: string;
  isPublicSearchLoading: boolean;
  agents: MuradianAskAgent[];
  onSelect: (id: MuradianAskAgentId) => void;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (agent: MuradianAskAgent) => void;
  onDelete: (agent: MuradianAskAgent) => void;
}

export function AgentPicker({
  selectedAgent,
  selectedAgentId,
  filteredAgents,
  filteredPublicAgents,
  agentSearch,
  isPublicSearchLoading,
  agents,
  onSelect,
  onSearchChange,
  onAdd,
  onEdit,
  onDelete,
}: AgentPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 gap-1.5 rounded-full border border-border/50 bg-background/55 px-2.5 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Select agent"
        >
          <HugeiconsIcon icon={AiChipIcon} size={15} strokeWidth={2} />
          <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">
            {selectedAgent?.name ?? "Normal ask"}
          </span>
          {selectedAgent?.visibility === "public" ? (
            <Globe2 className="h-3.5 w-3.5 text-primary" />
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[150] w-[21rem] rounded-2xl border-border/60 bg-background/95 p-2.5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-1">
          <div>
            <DropdownMenuLabel className="px-0 py-0 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Ask mode
            </DropdownMenuLabel>
            <p className="mt-1 text-sm font-medium text-foreground">
              {selectedAgent?.name ?? "Normal ask"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 rounded-xl px-2.5 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        <DropdownMenuItem
          onSelect={() => onSelect("")}
          className={cn(
            "mb-2 cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
            !selectedAgentId && "border-primary/20 bg-primary/10",
          )}
        >
          <div className="flex w-full items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <HugeiconsIcon icon={AiChipIcon} size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Normal ask
              </p>
              <p className="truncate text-[0.7rem] text-muted-foreground">
                Use regular MuradianAsk memory
              </p>
            </div>
            {!selectedAgentId ? (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            ) : null}
          </div>
        </DropdownMenuItem>

        <div className="border-t border-border/50 px-1 pb-2 pt-2">
          <Input
            value={agentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search agents..."
            className="h-9 rounded-xl border-border/70 bg-muted/35 text-sm"
          />
        </div>

        {filteredAgents.length === 0 &&
        filteredPublicAgents.length === 0 &&
        !isPublicSearchLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            {agents.length === 0
              ? "No agents yet. Add your first preference."
              : agentSearch.trim().length < 2
                ? "No private agent found. Type 2+ letters to search public agents."
                : "No agent found."}
          </div>
        ) : null}

        {filteredAgents.length > 0 ? (
          <DropdownMenuLabel className="px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Your agents
          </DropdownMenuLabel>
        ) : null}

        {filteredAgents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onSelect={() => onSelect(agent.id)}
            className={cn(
              "group cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
              selectedAgentId === agent.id && "border-primary/20 bg-primary/10",
            )}
          >
            <div className="flex w-full items-center gap-3">
              <div className="rounded-lg bg-muted p-1.5 text-primary transition-colors group-hover:bg-primary/10">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {agent.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                  {(agent.visibility ?? "private") === "public" ? (
                    <Globe2 className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {(agent.visibility ?? "private") === "public"
                    ? "Public"
                    : "Private"}
                </p>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                {selectedAgentId === agent.id ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : null}
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(agent);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label={`Edit ${agent.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(agent);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={`Delete ${agent.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        {isPublicSearchLoading ? (
          <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching public agents...
          </div>
        ) : null}

        {filteredPublicAgents.length > 0 ? (
          <DropdownMenuLabel className="px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Public agents
          </DropdownMenuLabel>
        ) : null}

        {filteredPublicAgents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onSelect={() => onSelect(agent.id)}
            className={cn(
              "group cursor-pointer rounded-xl border border-transparent px-3 py-2.5 focus:bg-accent",
              selectedAgentId === agent.id && "border-primary/20 bg-primary/10",
            )}
          >
            <div className="flex w-full items-center gap-3">
              <div className="rounded-lg bg-muted p-1.5 text-primary transition-colors group-hover:bg-primary/10">
                <Globe2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {agent.name}
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground">
                  {agent.description || "Public agent"}
                </p>
              </div>
              {selectedAgentId === agent.id ? (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              ) : null}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
