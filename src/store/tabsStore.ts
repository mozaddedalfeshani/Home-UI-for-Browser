import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tab {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  visitCount: number;
  shortcut?: string;
  openInNewWindow?: boolean;
}

interface TabsState {
  tabs: Tab[];
  addTab: (title: string, url: string) => void;
  addMultipleTabs: (tabs: Array<{title: string, url: string}>) => void;
  updateTab: (id: string, title: string, url: string, shortcut?: string, openInNewWindow?: boolean) => void;
  removeTab: (id: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  incrementVisitCount: (id: string) => void;
  getTabs: () => Tab[];
  updateTabShortcut: (id: string, shortcut: string | undefined) => void;
  getTabByShortcut: (shortcut: string) => Tab | undefined;
  resetTabs: () => void;
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
          visitCount: 0,
        };
        set((state) => ({
          tabs: [...state.tabs, newTab],
        }));
      },
      addMultipleTabs: (tabs) => {
        const newTabs: Tab[] = tabs.map((tab) => ({
          id: crypto.randomUUID(),
          title: tab.title,
          url: tab.url,
          createdAt: Date.now(),
          visitCount: 0,
        }));
        set((state) => ({
          tabs: [...state.tabs, ...newTabs],
        }));
      },
      updateTab: (id: string, title: string, url: string, shortcut?: string, openInNewWindow?: boolean) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, title, url, shortcut, openInNewWindow } : tab
          ),
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
      incrementVisitCount: (id: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, visitCount: tab.visitCount + 1 } : tab
          ),
        }));
      },
      getTabs: () => get().tabs,
      updateTabShortcut: (id: string, shortcut: string | undefined) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, shortcut } : tab
          ),
        }));
      },
      getTabByShortcut: (shortcut: string) => {
        return get().tabs.find((tab) => tab.shortcut === shortcut);
      },
      resetTabs: () => {
        set({ tabs: [] });
      },
    }),
    {
      name: "tabs-store",
      version: 1,
    }
  )
);
