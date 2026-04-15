"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TabClickHistoryEntry {
  id: string;
  tabId: string;
  title: string;
  url: string;
  createdAt: number;
  eventType: "tab";
}

interface TabClickHistoryState {
  entries: TabClickHistoryEntry[];
  addTabClickHistoryEntry: (tab: {
    id: string;
    title: string;
    url: string;
  }) => void;
  removeTabClickHistoryEntry: (id: string) => void;
  clearTabClickHistory: () => void;
}

const MAX_TAB_CLICK_HISTORY_ENTRIES = 100;

export const useTabClickHistoryStore = create<TabClickHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addTabClickHistoryEntry: (tab) => {
        const trimmedTitle = tab.title.trim();
        const trimmedUrl = tab.url.trim();

        if (!trimmedUrl) {
          return;
        }

        const nextEntry: TabClickHistoryEntry = {
          id: crypto.randomUUID(),
          tabId: tab.id,
          title: trimmedTitle || trimmedUrl,
          url: trimmedUrl,
          createdAt: Date.now(),
          eventType: "tab",
        };

        set((state) => ({
          entries: [nextEntry, ...state.entries].slice(
            0,
            MAX_TAB_CLICK_HISTORY_ENTRIES,
          ),
        }));
      },
      removeTabClickHistoryEntry: (id: string) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      clearTabClickHistory: () => set({ entries: [] }),
    }),
    {
      name: "tab-click-history-store",
      version: 1,
    },
  ),
);
