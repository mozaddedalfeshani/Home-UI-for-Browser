import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShareProfileTab } from "@/lib/shareProfile";
import { migrateShortcutToPrimaryModifier } from "@/lib/keyboardShortcuts";

export interface Tab {
  id: string;
  title: string;
  url: string;
  createdAt: number;
  visitCount: number;
  shortcut?: string;
  openInNewWindow?: boolean;
}

const DEFAULT_TABS: Tab[] = [
  {
    id: "1",
    title: "YouTube",
    url: "https://www.youtube.com",
    createdAt: Date.now(),
    visitCount: 0,
    shortcut: migrateShortcutToPrimaryModifier("y"),
  },
  {
    id: "2",
    title: "Share Editor",
    url: "https://paper.imurad.me",
    createdAt: Date.now(),
    visitCount: 0,
    shortcut: migrateShortcutToPrimaryModifier("s"),
  },
  {
    id: "3",
    title: "GitHub",
    url: "https://github.com",
    createdAt: Date.now(),
    visitCount: 0,
    shortcut: migrateShortcutToPrimaryModifier("h"),
  },
  {
    id: "4",
    title: "Gemini",
    url: "https://gemini.google.com",
    createdAt: Date.now(),
    visitCount: 0,
    shortcut: migrateShortcutToPrimaryModifier("g"),
  },
  {
    id: "5",
    title: "ChatGPT",
    url: "https://chatgpt.com",
    createdAt: Date.now(),
    visitCount: 0,
    shortcut: migrateShortcutToPrimaryModifier("c"),
  },
];

interface TabsState {
  tabs: Tab[];
  addTab: (title: string, url: string) => void;
  addMultipleTabs: (tabs: Array<{ title: string; url: string }>) => void;
  updateTab: (
    id: string,
    title: string,
    url: string,
    shortcut?: string,
    openInNewWindow?: boolean,
  ) => void;
  removeTab: (id: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  incrementVisitCount: (id: string) => void;
  getTabs: () => Tab[];
  updateTabShortcut: (id: string, shortcut: string | undefined) => void;
  getTabByShortcut: (shortcut: string) => Tab | undefined;
  getShareableTabs: () => ShareProfileTab[];
  replaceTabsFromShareProfile: (tabs: ShareProfileTab[]) => void;
  resetTabs: () => void;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: DEFAULT_TABS,
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
      updateTab: (
        id: string,
        title: string,
        url: string,
        shortcut?: string,
        openInNewWindow?: boolean,
      ) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id
              ? { ...tab, title, url, shortcut, openInNewWindow }
              : tab,
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
            tab.id === id ? { ...tab, visitCount: tab.visitCount + 1 } : tab,
          ),
        }));
      },
      getTabs: () => get().tabs,
      updateTabShortcut: (id: string, shortcut: string | undefined) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, shortcut } : tab,
          ),
        }));
      },
      getTabByShortcut: (shortcut: string) => {
        return get().tabs.find((tab) => tab.shortcut === shortcut);
      },
      getShareableTabs: () => {
        return get().tabs.map((tab) => ({
          title: tab.title,
          url: tab.url,
          shortcut: tab.shortcut,
          openInNewWindow: tab.openInNewWindow,
        }));
      },
      replaceTabsFromShareProfile: (tabs) => {
        const now = Date.now();
        set({
          tabs: tabs.map((tab, index) => ({
            id: crypto.randomUUID(),
            title: tab.title,
            url: tab.url,
            createdAt: now + index,
            visitCount: 0,
            shortcut: tab.shortcut,
            openInNewWindow: tab.openInNewWindow,
          })),
        });
      },
      resetTabs: () => {
        set({ tabs: DEFAULT_TABS });
      },
    }),
    {
      name: "tabs-store",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as TabsState | undefined;

        if (!state?.tabs) {
          return persistedState;
        }

        return {
          ...state,
          tabs: state.tabs.map((tab) => ({
            ...tab,
            shortcut: migrateShortcutToPrimaryModifier(tab.shortcut),
          })),
        };
      },
    },
  ),
);
