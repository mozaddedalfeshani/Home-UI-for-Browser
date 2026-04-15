import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SearchHistoryEntry {
  id: string;
  value: string;
  normalizedValue: string;
  createdAt: number;
}

interface SearchHistoryState {
  entries: SearchHistoryEntry[];
  addSearchHistoryEntry: (value: string) => void;
  removeSearchHistoryEntry: (id: string) => void;
  clearSearchHistory: () => void;
}

const MAX_SEARCH_HISTORY_ENTRIES = 100;

const normalizeSearchValue = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addSearchHistoryEntry: (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
          return;
        }

        const normalizedValue = normalizeSearchValue(trimmedValue);
        const nextEntry: SearchHistoryEntry = {
          id: crypto.randomUUID(),
          value: trimmedValue,
          normalizedValue,
          createdAt: Date.now(),
        };

        set((state) => {
          const dedupedEntries = state.entries.filter(
            (entry) => entry.normalizedValue !== normalizedValue,
          );

          return {
            entries: [nextEntry, ...dedupedEntries].slice(
              0,
              MAX_SEARCH_HISTORY_ENTRIES,
            ),
          };
        });
      },
      removeSearchHistoryEntry: (id: string) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      clearSearchHistory: () => set({ entries: [] }),
    }),
    {
      name: "search-history-store",
      version: 1,
    },
  ),
);
