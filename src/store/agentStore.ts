"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AIBehaviorPreset,
  AILanguagePreset,
  AIProvider,
} from "@/store/aiSidebarStore";

export type AgentType = "generic";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  provider: AIProvider;
  apiKey: string;
  model: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
  createdAt: string;
  updatedAt: string;
}

type AgentInput = Omit<AgentDefinition, "id" | "createdAt" | "updatedAt">;

interface AgentStoreState {
  agents: AgentDefinition[];
  addAgent: (agent: AgentInput) => AgentDefinition;
  updateAgent: (id: string, updates: Partial<AgentInput>) => void;
  deleteAgent: (id: string) => void;
  getAgentById: (id: string) => AgentDefinition | undefined;
}

export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      agents: [],
      addAgent: (agent) => {
        const nextAgent: AgentDefinition = {
          ...agent,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          agents: [nextAgent, ...state.agents],
        }));

        return nextAgent;
      },
      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : agent,
          ),
        })),
      deleteAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        })),
      getAgentById: (id) => get().agents.find((agent) => agent.id === id),
    }),
    {
      name: "agent-store",
      version: 1,
    },
  ),
);
