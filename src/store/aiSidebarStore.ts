"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GRAMMAR_FIXER_AGENT_ID } from "./agentStore";

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

interface GeneralAIConfig {
  provider: AIProvider;
  apiKey: string;
  openRouterModel: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
  isConfigured: boolean;
}

interface AppliedAgentProfile {
  id: string;
  name: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
}

interface AISidebarState {
  provider: AIProvider;
  apiKey: string;
  openRouterModel: string;
  rules: string;
  language: AILanguagePreset;
  behavior: AIBehaviorPreset;
  activeAgentId: string | null;
  activeAgentName: string | null;
  generalConfig: GeneralAIConfig;
  sendHistory: boolean;
  messages: AIChatMessage[];
  isConfigured: boolean;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (apiKey: string) => void;
  setOpenRouterModel: (openRouterModel: string) => void;
  setRules: (rules: string) => void;
  setLanguage: (language: AILanguagePreset) => void;
  setBehavior: (behavior: AIBehaviorPreset) => void;
  setSendHistory: (sendHistory: boolean) => void;
  applyAgentProfile: (profile: AppliedAgentProfile) => void;
  clearActiveAgent: () => void;
  completeSetup: () => void;
  resetSetup: () => void;
  addMessage: (message: Omit<AIChatMessage, "id" | "createdAt">) => string;
  updateMessageContent: (id: string, content: string) => void;
  clearMessages: () => void;
}

const DEFAULT_GENERAL_CONFIG: GeneralAIConfig = {
  provider: "deepseek",
  apiKey: "",
  openRouterModel: "openrouter/auto",
  rules: "",
  language: "english",
  behavior: "balanced",
  isConfigured: false,
};

export const useAISidebarStore = create<AISidebarState>()(
  persist(
    (set) => ({
      provider: DEFAULT_GENERAL_CONFIG.provider,
      apiKey: DEFAULT_GENERAL_CONFIG.apiKey,
      openRouterModel: DEFAULT_GENERAL_CONFIG.openRouterModel,
      rules: DEFAULT_GENERAL_CONFIG.rules,
      language: DEFAULT_GENERAL_CONFIG.language,
      behavior: DEFAULT_GENERAL_CONFIG.behavior,
      activeAgentId: null,
      activeAgentName: null,
      generalConfig: DEFAULT_GENERAL_CONFIG,
      sendHistory: false,
      messages: [],
      isConfigured: DEFAULT_GENERAL_CONFIG.isConfigured,
      setProvider: (provider) =>
        set((state) => ({
          provider,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                provider,
              },
        })),
      setApiKey: (apiKey) =>
        set((state) => ({
          apiKey,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                apiKey,
              },
        })),
      setOpenRouterModel: (openRouterModel) =>
        set((state) => ({
          openRouterModel,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                openRouterModel,
              },
        })),
      setRules: (rules) =>
        set((state) => ({
          rules,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                rules,
              },
        })),
      setLanguage: (language) =>
        set((state) => ({
          language,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                language,
              },
        })),
      setBehavior: (behavior) =>
        set((state) => ({
          behavior,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                behavior,
              },
        })),
      setSendHistory: (sendHistory) => set({ sendHistory }),
      applyAgentProfile: (profile) =>
        set((state) => {
          // Check if this is a predefined agent that should use global config
          const isPredefinedAgent = profile.id === GRAMMAR_FIXER_AGENT_ID;

          return {
            provider: isPredefinedAgent
              ? state.generalConfig.provider
              : profile.provider,
            apiKey: isPredefinedAgent
              ? state.generalConfig.apiKey
              : profile.apiKey,
            openRouterModel: isPredefinedAgent
              ? state.generalConfig.openRouterModel || "openai/gpt-oss-20b"
              : profile.provider === "openrouter"
                ? profile.model
                : "openrouter/auto",
            rules: profile.rules,
            language: profile.language,
            behavior: profile.behavior,
            activeAgentId: profile.id,
            activeAgentName: profile.name,
            isConfigured: true,
          };
        }),
      clearActiveAgent: () =>
        set((state) => ({
          provider: state.generalConfig.provider,
          apiKey: state.generalConfig.apiKey,
          openRouterModel: state.generalConfig.openRouterModel,
          rules: state.generalConfig.rules,
          language: state.generalConfig.language,
          behavior: state.generalConfig.behavior,
          isConfigured: state.generalConfig.isConfigured,
          activeAgentId: null,
          activeAgentName: null,
        })),
      completeSetup: () =>
        set((state) => ({
          isConfigured: true,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : {
                ...state.generalConfig,
                isConfigured: true,
              },
        })),
      resetSetup: () =>
        set((state) => ({
          isConfigured: false,
          activeAgentId: null,
          activeAgentName: null,
          provider: DEFAULT_GENERAL_CONFIG.provider,
          apiKey: DEFAULT_GENERAL_CONFIG.apiKey,
          openRouterModel: DEFAULT_GENERAL_CONFIG.openRouterModel,
          rules: DEFAULT_GENERAL_CONFIG.rules,
          language: DEFAULT_GENERAL_CONFIG.language,
          behavior: DEFAULT_GENERAL_CONFIG.behavior,
          generalConfig: state.activeAgentId
            ? state.generalConfig
            : DEFAULT_GENERAL_CONFIG,
        })),
      addMessage: (message) => {
        const id = crypto.randomUUID();
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id,
              createdAt: Date.now(),
              ...message,
            },
          ],
        }));
        return id;
      },
      updateMessageContent: (id, content) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, content } : message,
          ),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "ai-sidebar-store",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (
          version < 2 &&
          typeof persistedState === "object" &&
          persistedState !== null
        ) {
          const legacyState = persistedState as Partial<AISidebarState>;

          return {
            ...legacyState,
            generalConfig: {
              provider: legacyState.provider ?? DEFAULT_GENERAL_CONFIG.provider,
              apiKey: legacyState.apiKey ?? DEFAULT_GENERAL_CONFIG.apiKey,
              openRouterModel:
                legacyState.openRouterModel ??
                DEFAULT_GENERAL_CONFIG.openRouterModel,
              rules: legacyState.rules ?? DEFAULT_GENERAL_CONFIG.rules,
              language: legacyState.language ?? DEFAULT_GENERAL_CONFIG.language,
              behavior: legacyState.behavior ?? DEFAULT_GENERAL_CONFIG.behavior,
              isConfigured:
                legacyState.isConfigured ?? DEFAULT_GENERAL_CONFIG.isConfigured,
            },
          };
        }

        return persistedState;
      },
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        openRouterModel: state.openRouterModel,
        rules: state.rules,
        language: state.language,
        behavior: state.behavior,
        activeAgentId: state.activeAgentId,
        activeAgentName: state.activeAgentName,
        generalConfig: state.generalConfig,
        sendHistory: state.sendHistory,
        messages: state.messages,
        isConfigured: state.isConfigured,
      }),
    },
  ),
);
