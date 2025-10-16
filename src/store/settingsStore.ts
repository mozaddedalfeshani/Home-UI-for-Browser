import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  setTheme: (theme: Theme) => void;
  toggleAutoOrderTabs: () => void;
  toggleShowClock: () => void;
  toggleShowRightSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      autoOrderTabs: false,
      showClock: true,
      showRightSidebar: true,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () => set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () => set((state) => ({ showRightSidebar: !state.showRightSidebar })),
    }),
    {
      name: "settings-store",
      version: 1,
    }
  )
);
