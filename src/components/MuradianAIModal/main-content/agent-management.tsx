"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  PlusSignIcon, 
  Delete02Icon, 
  PencilEdit01Icon, 
  Settings02Icon,
  BotIcon,
  ArrowLeft01Icon,
  Tick01Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStore, AgentDefinition } from "@/store/agentStore";
import { useMuradianAiStore } from "@/store/muradianAiStore";
import { cn } from "@/lib/utils";

export const AgentManagement = () => {
  const { agents, addAgent, updateAgent, deleteAgent } = useAgentStore();
  const { setActiveView } = useMuradianAiStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AgentDefinition>>({});

  const handleCreate = () => {
    const newAgent = addAgent({
      name: "New Agent",
      description: "My custom agent",
      type: "generic",
      provider: "deepseek",
      apiKey: "global",
      model: "deepseek-v4-flash",
      rules: "You are a helpful assistant. Give direct answers and keep them as simple as possible. Avoid unnecessary explanations unless explicitly asked.",
      language: "auto",
      behavior: "professional",
    });
    setEditingId(newAgent.id);
    setFormData(newAgent);
  };

  const handleEdit = (agent: AgentDefinition) => {
    setEditingId(agent.id);
    setFormData(agent);
  };

  const handleSave = () => {
    if (editingId) {
      updateAgent(editingId, formData);
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveView("chat")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">Agent Management</h2>
            <p className="text-sm text-muted-foreground">Setup your own system, rules and persona.</p>
          </div>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-500/20"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} />
          Create New Agent
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-60">
              <HugeiconsIcon icon={BotIcon} size={48} className="text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No custom agents yet</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Create an agent to give the AI specific rules and expertise.
              </p>
            </div>
          ) : (
            agents.map((agent) => (
              <div 
                key={agent.id}
                className={cn(
                  "group relative p-6 rounded-3xl border transition-all duration-300",
                  editingId === agent.id 
                    ? "border-indigo-500 bg-indigo-50/5 dark:bg-indigo-500/5 ring-1 ring-indigo-500/20" 
                    : "border-border bg-card hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5"
                )}
              >
                {editingId === agent.id ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Agent Name</label>
                        <Input 
                          value={formData.name || ""} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="rounded-xl border-border bg-background h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Short Description</label>
                        <Input 
                          value={formData.description || ""} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="rounded-xl border-border bg-background h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">System Rules & Persona</label>
                      <Textarea 
                        value={formData.rules || ""} 
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        className="rounded-2xl border-border bg-background min-h-[160px] p-4 text-sm leading-relaxed focus-visible:ring-indigo-500/20"
                        placeholder="e.g. You are a code expert. Always respond with clean, commented code snippets..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setEditingId(null)}
                        className="rounded-xl gap-2 hover:bg-destructive/5 hover:text-destructive transition-colors"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={18} />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <HugeiconsIcon icon={Tick01Icon} size={18} />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                        <HugeiconsIcon icon={BotIcon} size={28} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          {agent.name}
                          {agent.type === "predefined" && (
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">System</span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 italic">
                          "{agent.rules.slice(0, 150)}..."
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(agent)}
                        className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                      </Button>
                      {agent.type !== "predefined" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteAgent(agent.id)}
                          className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={18} />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
