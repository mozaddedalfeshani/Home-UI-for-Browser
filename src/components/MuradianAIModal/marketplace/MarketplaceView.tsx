"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  Globe2,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type MuradianAskAgent,
  type MuradianAskAgentId,
  useMuradianAskAgentStore,
} from "@/store/muradianAskAgentStore";

interface MarketplaceViewProps {
  selectedAgentId: MuradianAskAgentId;
  onBack: () => void;
  onUseAgent: (id: MuradianAskAgentId) => void;
  onAddAgent: () => void;
  onEditAgent: (agent: MuradianAskAgent) => void;
  onDeleteAgent: (agent: MuradianAskAgent) => void;
}

export function MarketplaceView({
  selectedAgentId,
  onBack,
  onUseAgent,
  onAddAgent,
  onEditAgent,
  onDeleteAgent,
}: MarketplaceViewProps) {
  const agents = useMuradianAskAgentStore((s) => s.agents);
  const installedAgents = useMuradianAskAgentStore((s) => s.installedAgents);
  const installAgent = useMuradianAskAgentStore((s) => s.installAgent);
  const uninstallAgent = useMuradianAskAgentStore((s) => s.uninstallAgent);

  const PAGE_SIZE = 12;

  const [search, setSearch] = useState("");
  const [publicAgents, setPublicAgents] = useState<MuradianAskAgent[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const ownIds = new Set(agents.map((a) => a.id));

  const fetchAgents = async (q: string, off: number, append: boolean) => {
    const loading = append ? setIsLoadingMore : setIsLoading;
    loading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
      if (q.length >= 2) params.set("query", q);
      const res = await fetch(`/api/ai/agents/public?${params}`);
      if (!res.ok) return;
      const data = (await res.json()) as { agents: Partial<MuradianAskAgent>[]; total: number };
      const mapped = data.agents
        .filter((a) => !ownIds.has(a.id!))
        .map((a) => ({ ...a, systemInstruction: "", visibility: "public" as const })) as MuradianAskAgent[];
      setPublicAgents((prev) => append ? [...prev, ...mapped] : mapped);
      setTotal(data.total);
    } catch {
      if (!append) setPublicAgents([]);
    } finally {
      loading(false);
    }
  };

  useEffect(() => {
    const q = search.trim();
    setOffset(0);
    const timer = setTimeout(() => fetchAgents(q, 0, false), q ? 300 : 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleLoadMore = () => {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    fetchAgents(search.trim(), next, true);
  };

  const filteredOwn = agents.filter((a) =>
    !search.trim() || a.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const hasMore = offset + PAGE_SIZE < total;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isLoading, offset]);

  const isInstalled = (id: MuradianAskAgentId) =>
    installedAgents.some((a) => a.id === id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/20 px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Agent Marketplace</p>
          <p className="text-[11px] text-muted-foreground">Browse and install agents</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-xl px-2.5 text-xs"
          onClick={onAddAgent}
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search public agents..."
          className="h-9 rounded-xl border-border/60 bg-muted/30 text-sm"
          autoFocus
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Normal ask option */}
        <div>
          <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Default
          </p>
          <AgentCard
            icon={<Bot className="h-4 w-4" />}
            name="Normal ask"
            description="Use regular MuradianAsk memory"
            isSelected={!selectedAgentId}
            badge={null}
            actions={
              <Button
                type="button"
                size="sm"
                variant={!selectedAgentId ? "default" : "outline"}
                className="h-7 rounded-lg px-3 text-xs"
                onClick={() => onUseAgent("")}
              >
                {!selectedAgentId ? <Check className="h-3 w-3" /> : null}
                {!selectedAgentId ? "Active" : "Use"}
              </Button>
            }
          />
        </div>

        {/* Own agents */}
        {filteredOwn.length > 0 && (
          <div>
            <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Your agents
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredOwn.map((agent) => (
                <AgentCard
                  key={agent.id}
                  icon={<Bot className="h-4 w-4" />}
                  name={agent.name}
                  description={agent.description || "No description"}
                  isSelected={selectedAgentId === agent.id}
                  badge={
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {agent.visibility === "public" ? (
                        <Globe2 className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {agent.visibility === "public" ? "Public" : "Private"}
                    </span>
                  }
                  actions={
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedAgentId === agent.id ? "default" : "outline"}
                        className="h-7 rounded-lg px-3 text-xs"
                        onClick={() => onUseAgent(agent.id)}
                      >
                        {selectedAgentId === agent.id ? <Check className="h-3 w-3" /> : null}
                        {selectedAgentId === agent.id ? "Active" : "Use"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => onEditAgent(agent)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAgent(agent)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Installed public agents */}
        {installedAgents.filter((a) => !ownIds.has(a.id)).length > 0 && (
          <div>
            <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Installed
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {installedAgents
                .filter((a) => !ownIds.has(a.id))
                .map((agent) => (
                  <AgentCard
                    key={agent.id}
                    icon={<Globe2 className="h-4 w-4" />}
                    name={agent.name}
                    description={agent.description || "Public agent"}
                    isSelected={selectedAgentId === agent.id}
                    badge={
                      <span className="flex items-center gap-1 text-[10px] text-primary">
                        <Check className="h-3 w-3" /> Installed
                      </span>
                    }
                    actions={
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={selectedAgentId === agent.id ? "default" : "outline"}
                          className="h-7 rounded-lg px-3 text-xs"
                          onClick={() => onUseAgent(agent.id)}
                        >
                          {selectedAgentId === agent.id ? <Check className="h-3 w-3" /> : null}
                          {selectedAgentId === agent.id ? "Active" : "Use"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => uninstallAgent(agent.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Uninstall"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    }
                  />
                ))}
            </div>
          </div>
        )}

        {/* Public agents (browse + search) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {search.trim() ? "Search results" : "All public agents"}
            </p>
            {total > 0 && (
              <span className="text-[10px] text-muted-foreground/60">{total} agents</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : publicAgents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {search.trim() ? "No agents found." : "No public agents available."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                {publicAgents.map((agent) => {
                  const installed = isInstalled(agent.id);
                  return (
                    <AgentCard
                      key={agent.id}
                      icon={<Globe2 className="h-4 w-4" />}
                      name={agent.name}
                      description={agent.description || "Public agent"}
                      isSelected={selectedAgentId === agent.id}
                      badge={
                        installed ? (
                          <span className="flex items-center gap-1 text-[10px] text-primary">
                            <Check className="h-3 w-3" /> Installed
                          </span>
                        ) : null
                      }
                      actions={
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant={selectedAgentId === agent.id ? "default" : "outline"}
                            className="h-7 rounded-lg px-3 text-xs"
                            onClick={() => onUseAgent(agent.id)}
                          >
                            {selectedAgentId === agent.id ? <Check className="h-3 w-3" /> : null}
                            {selectedAgentId === agent.id ? "Active" : "Use"}
                          </Button>
                          {installed ? (
                            <button
                              type="button"
                              onClick={() => uninstallAgent(agent.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Uninstall"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => installAgent(agent)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              title="Install"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </div>

              <div ref={sentinelRef} className="mt-2 flex h-8 items-center justify-center">
                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  icon,
  name,
  description,
  isSelected,
  badge,
  actions,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  isSelected: boolean;
  badge: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-2xl border p-3 transition-colors",
        isSelected ? "border-primary/30 bg-primary/8" : "border-border/40 bg-muted/20",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn("shrink-0 rounded-xl p-1.5", isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground leading-tight">{name}</p>
          {badge && <div className="mt-0.5">{badge}</div>}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
      <div className="flex items-center gap-1 mt-auto">{actions}</div>
    </div>
  );
}
