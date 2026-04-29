"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

export interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

interface MuradianAiState {
  currentSessionId: string | null;
  messages: Message[];
  sessions: ChatSession[];
  isLoading: boolean;
  activeAgentId: string | null;
  activeView: "chat" | "agents" | "settings";

  // Actions
  setCurrentSessionId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setActiveAgentId: (id: string | null) => void;
  setActiveView: (view: "chat" | "agents" | "settings") => void;

  // Async Actions
  fetchSessions: () => Promise<void>;
  saveCurrentSession: (title?: string) => Promise<void>;
  createNewChat: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const useMuradianAiStore = create<MuradianAiState>()(
  persist(
    (set, get) => ({
      currentSessionId: null,
      messages: [],
      sessions: [],
      isLoading: false,
      activeAgentId: null,
      activeView: "chat",

      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (loading) => set({ isLoading: loading }),
      setActiveAgentId: (id) => set({ activeAgentId: id }),
      setActiveView: (view) => set({ activeView: view }),

      fetchSessions: async () => {
        try {
          const res = await fetch("/api/ai/sessions");
          if (res.ok) {
            const data = (await res.ok) ? await res.json() : { sessions: [] };
            set({ sessions: data.sessions || [] });
          }
        } catch (error) {
          console.error("Failed to fetch sessions", error);
        }
      },

      saveCurrentSession: async (title?: string) => {
        const { currentSessionId, messages, sessions } = get();
        if (messages.length === 0) return;

        const existingSession = sessions.find(
          (s) => s._id === currentSessionId,
        );
        const finalTitle = title || existingSession?.title || "Chat Session";

        try {
          const url = currentSessionId
            ? `/api/ai/sessions/${currentSessionId}`
            : "/api/ai/sessions";
          const method = currentSessionId ? "PUT" : "POST";

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: finalTitle, messages }),
          });

          if (res.ok) {
            const data = await res.json();
            if (!currentSessionId && data.sessionId) {
              set({ currentSessionId: data.sessionId });
            }
            get().fetchSessions();
          }
        } catch (error) {
          console.error("Failed to save session", error);
        }
      },

      createNewChat: () => {
        set({ currentSessionId: null, messages: [], activeView: "chat" });
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, activeView: "chat" });
        try {
          const res = await fetch(`/api/ai/sessions/${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            set({
              currentSessionId: sessionId,
              messages: data.session.messages || [],
            });
          }
        } catch (error) {
          console.error("Failed to load session", error);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteSession: async (sessionId: string) => {
        try {
          const res = await fetch(`/api/ai/sessions/${sessionId}`, {
            method: "DELETE",
          });
          if (res.ok) {
            if (get().currentSessionId === sessionId) {
              get().createNewChat();
            }
            get().fetchSessions();
          }
        } catch (error) {
          console.error("Failed to delete session", error);
        }
      },
    }),
    {
      name: "muradian-ai-storage",
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);
