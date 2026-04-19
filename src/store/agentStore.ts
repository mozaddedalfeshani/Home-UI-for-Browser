"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AIBehaviorPreset,
  AILanguagePreset,
  AIProvider,
} from "@/store/aiSidebarStore";

export type AgentType = "generic" | "predefined";

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
  ensurePredefinedAgents: () => void;
  isPredefinedAgent: (id: string) => boolean;
}

export const GRAMMAR_FIXER_AGENT_ID = "predefined-grammar-fixer";

export const GRAMMAR_FIXER_AGENT_CONFIG: AgentInput = {
  name: "Grammar Fixer",
  description:
    "Fixes grammar and sentence structure, returns only the corrected text without explanations",
  type: "predefined",
  provider: "deepseek", // Will be overridden by global config
  apiKey: "global", // Uses global API key
  model: "global", // Uses global model selection
  rules:
    "You are a grammar correction tool. Your task is to fix grammar, spelling, and sentence structure errors.\n\nSTRICT RULES - FOLLOW EXACTLY:\n1. OUTPUT ONLY the corrected text\n2. NO explanations, NO introductions, NO bullet points, NO questions\n3. NO phrases like 'Here is the corrected text', 'The corrected version is', 'Here you go'\n4. If text is already correct, output it unchanged\n5. Preserve original meaning and tone exactly\n6. Never ask for clarification or provide alternatives\n\nEXAMPLE:\nInput: 'I has a apple and she go to store'\nOutput: 'I have an apple and she goes to the store'\n\nNow fix the user's text. Output ONLY the corrected result:",
  language: "auto",
  behavior: "professional",
};

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
      isPredefinedAgent: (id) => id === GRAMMAR_FIXER_AGENT_ID,
      ensurePredefinedAgents: () => {
        const { agents } = get();

        // Check if grammar fixer agent exists
        const hasGrammarFixer = agents.some(
          (agent) => agent.id === GRAMMAR_FIXER_AGENT_ID,
        );

        if (!hasGrammarFixer) {
          const grammarFixer: AgentDefinition = {
            ...GRAMMAR_FIXER_AGENT_CONFIG,
            id: GRAMMAR_FIXER_AGENT_ID,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            agents: [grammarFixer, ...state.agents],
          }));
        }
      },
    }),
    {
      name: "agent-store",
      version: 1,
    },
  ),
);
