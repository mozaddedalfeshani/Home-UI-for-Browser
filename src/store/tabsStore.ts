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
  moveTab: (fromIndex: number, toIndex: number) => void;
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
      moveTab: (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) {
          return;
        }

        set((state) => {
          const nextTabs = [...state.tabs];
          const [moved] = nextTabs.splice(fromIndex, 1);

          if (!moved) {
            return state;
          }

          nextTabs.splice(toIndex, 0, moved);
          return {
            tabs: nextTabs,
          };
        });
      },
      getTabs: () => get().tabs,
    }),
    {
      name: "tabs-store",
      version: 1,
    }
  )
);
