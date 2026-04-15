"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIProvider = "deepseek" | "openrouter";
export type AIMessageRole = "user" | "assistant";
export type AILanguagePreset = "english" | "bangla" | "auto";
export type AIBehaviorPreset = "balanced" | "friendly" | "professional";

export interface AIChatMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: number;
}

interface AISidebarState {
  provider: AIProvider;
  apiKey: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
  sendHistory: boolean;
  messages: AIChatMessage[];
  isConfigured: boolean;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (apiKey: string) => void;
  setRules: (rules: string) => void;
  setLanguage: (language: AILanguagePreset) => void;
  setBehavior: (behavior: AIBehaviorPreset) => void;
  setSendHistory: (sendHistory: boolean) => void;
  completeSetup: () => void;
  resetSetup: () => void;
  addMessage: (message: Omit<AIChatMessage, "id" | "createdAt">) => void;
  clearMessages: () => void;
}

export const useAISidebarStore = create<AISidebarState>()(
  persist(
    (set) => ({
      provider: "deepseek",
      apiKey: "",
      rules: "",
      language: "english",
      behavior: "balanced",
      sendHistory: false,
      messages: [],
      isConfigured: false,
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setRules: (rules) => set({ rules }),
      setLanguage: (language) => set({ language }),
      setBehavior: (behavior) => set({ behavior }),
      setSendHistory: (sendHistory) => set({ sendHistory }),
      completeSetup: () => set({ isConfigured: true }),
      resetSetup: () => set({ isConfigured: false }),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              ...message,
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "ai-sidebar-store",
      version: 1,
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        rules: state.rules,
        language: state.language,
        behavior: state.behavior,
        sendHistory: state.sendHistory,
        messages: state.messages,
        isConfigured: state.isConfigured,
      }),
    },
  ),
);
