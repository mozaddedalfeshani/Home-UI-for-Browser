import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tab {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

interface TabsState {
  tabs: Tab[];
  addTab: (title: string, url: string) => void;
  removeTab: (id: string) => void;
  getTabs: () => Tab[];
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      addTab: (title: string, url: string) => {
        const newTab: Tab = {
          id: crypto.randomUUID(),
          title,
          url,
          createdAt: Date.now(),
        };
        set((state) => ({
          tabs: [...state.tabs, newTab],
        }));
      },
      removeTab: (id: string) => {
        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.id !== id),
        }));
      },
      getTabs: () => get().tabs,
    }),
    {
      name: "tabs-store",
      version: 1,
    }
  )
);
