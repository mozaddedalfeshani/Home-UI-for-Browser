import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  cardSize: number;
  setTheme: (theme: Theme) => void;
  toggleAutoOrderTabs: () => void;
  toggleShowClock: () => void;
  toggleShowRightSidebar: () => void;
  setCardSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      autoOrderTabs: false,
      showClock: true,
      showRightSidebar: true,
      cardSize: 7,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () => set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () => set((state) => ({ showRightSidebar: !state.showRightSidebar })),
      setCardSize: (size) => set({ cardSize: size }),
    }),
    {
      name: "settings-store",
      version: 1,
    }
  )
);
