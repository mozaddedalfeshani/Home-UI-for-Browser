"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  AiChat02Icon,
  Delete02Icon,
  BotIcon,
  ArrowDown01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useMuradianAiStore } from "@/store/muradianAiStore";
import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SidebarBody = () => {
  const {
    sessions,
    currentSessionId,
    createNewChat,
    loadSession,
    deleteSession,
    activeAgentId,
    setActiveAgentId,
    setActiveView,
  } = useMuradianAiStore();

  const { agents } = useAgentStore();
  const activeAgent = agents.find((a) => a.id === activeAgentId);

  return (
    <>
      {/* New Chat Button */}
      <div className="p-3 px-4">
        <Button
          onClick={createNewChat}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2 font-medium h-10 text-sm shadow-sm"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New Chat
        </Button>
      </div>

      {/* Agents Dropdown */}
      <div className="px-4 py-2">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Selected Agent
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-transparent focus:outline-none truncate">
              <HugeiconsIcon
                icon={BotIcon}
                size={18}
                className="text-indigo-500 shrink-0"
              />
              <span className="flex-1 truncate text-left">
                {activeAgent ? activeAgent.name : "Default Assistant"}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={14}
                className="text-muted-foreground"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 rounded-xl p-2 shadow-xl border-border bg-card"
          >
            <DropdownMenuItem
              onClick={() => setActiveAgentId(null)}
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors",
                !activeAgentId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted",
              )}
            >
              <HugeiconsIcon icon={AiChat02Icon} size={18} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Default Assistant</span>
                <span className="text-[10px] text-muted-foreground">
                  General purpose help
                </span>
              </div>
            </DropdownMenuItem>

            {agents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => setActiveAgentId(agent.id)}
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors",
                  activeAgentId === agent.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted",
                )}
              >
                <HugeiconsIcon icon={BotIcon} size={18} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                    {agent.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}

            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => setActiveView("agents")}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <HugeiconsIcon icon={Settings02Icon} size={14} />
                Manage Agents
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 px-3 space-y-0.5 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Recent Chats
        </p>

        {sessions.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-muted-foreground">No history yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session._id}
              className={cn(
                "group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent/50 cursor-pointer",
                currentSessionId === session._id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
              onClick={() => loadSession(session._id)}
            >
              <HugeiconsIcon
                icon={AiChat02Icon}
                size={18}
                className="shrink-0"
              />
              <span className="truncate flex-1">
                {session.title || "New Chat"}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
};
