"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MuradianAskAgentId = string;
export type MuradianAskAgentVisibility = "private" | "public";

export interface MuradianAskAgent {
  id: MuradianAskAgentId;
  name: string;
  description: string;
  systemInstruction: string;
  visibility: MuradianAskAgentVisibility;
  createdAt: string;
  updatedAt: string;
}

export type MuradianAskAgentInput = Pick<
  MuradianAskAgent,
  "name" | "description" | "systemInstruction" | "visibility"
>;

interface MuradianAskAgentState {
  agents: MuradianAskAgent[];
  isLoading: boolean;
  fetchAgents: () => Promise<void>;
  createAgent: (input: MuradianAskAgentInput) => Promise<MuradianAskAgent>;
  updateAgent: (
    id: MuradianAskAgentId,
    updates: MuradianAskAgentInput,
  ) => Promise<void>;
  deleteAgent: (id: MuradianAskAgentId) => Promise<void>;
  getAgentById: (id: MuradianAskAgentId) => MuradianAskAgent | undefined;
}

export const useMuradianAskAgentStore = create<MuradianAskAgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      isLoading: false,
      fetchAgents: async () => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/ai/agents");
          if (!response.ok) return;

          const data = await response.json();
          set({ agents: data.agents ?? [] });
        } catch (error) {
          console.error("Failed to fetch MuradianAsk agents", error);
        } finally {
          set({ isLoading: false });
        }
      },
      createAgent: async (input) => {
        const response = await fetch("/api/ai/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error("Failed to create MuradianAsk agent");
        }

        const data = await response.json();
        const agent = data.agent as MuradianAskAgent;

        set((state) => ({
          agents: [agent, ...state.agents],
        }));

        return agent;
      },
      updateAgent: async (id, updates) => {
        const response = await fetch(`/api/ai/agents/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update MuradianAsk agent");
        }

        const data = await response.json();
        const updatedAgent = data.agent as Partial<MuradianAskAgent>;

        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  ...updates,
                  updatedAt: updatedAgent.updatedAt ?? new Date().toISOString(),
                }
              : agent,
          ),
        }));
      },
      deleteAgent: async (id) => {
        const response = await fetch(`/api/ai/agents/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete MuradianAsk agent");
        }

        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        }));
      },
      getAgentById: (id) => get().agents.find((agent) => agent.id === id),
    }),
    {
      name: "muradian-ask-agent-store",
      version: 2,
      partialize: (state) => ({ agents: state.agents }),
    },
  ),
);
