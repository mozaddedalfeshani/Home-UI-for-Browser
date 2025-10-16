import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type ClockPosition = "top-left" | "top-center" | "top-right";

interface SettingsState {
  theme: Theme;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  cardSize: number;
  cardRadius: number;
  backgroundImage: string | null;
  hasSeenWelcome: boolean;
  userProfile: 'developer' | 'gamer' | 'normal' | null;
  clockColor: string;
  showClockGlow: boolean;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  clockPosition: ClockPosition;
  isHydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleAutoOrderTabs: () => void;
  toggleShowClock: () => void;
  toggleShowRightSidebar: () => void;
  setCardSize: (size: number) => void;
  setCardRadius: (radius: number) => void;
  setBackgroundImage: (image: string | null) => void;
  setHasSeenWelcome: (seen: boolean) => void;
  setUserProfile: (profile: 'developer' | 'gamer' | 'normal' | null) => void;
  setClockColor: (color: string) => void;
  setShowClockGlow: (show: boolean) => void;
  setClockFormat: (format: '12h' | '24h') => void;
  setShowSeconds: (show: boolean) => void;
  setClockPosition: (position: ClockPosition) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      autoOrderTabs: false,
      showClock: true,
      showRightSidebar: true,
      cardSize: 7,
      cardRadius: 1.5,
      backgroundImage: null,
      hasSeenWelcome: false,
      userProfile: null,
      clockColor: "#22c55e",
      showClockGlow: true,
      clockFormat: "24h",
      showSeconds: true,
      clockPosition: "top-left",
      isHydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () => set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () => set((state) => ({ showRightSidebar: !state.showRightSidebar })),
      setCardSize: (size) => set({ cardSize: size }),
      setCardRadius: (radius) => set({ cardRadius: radius }),
      setBackgroundImage: (image) => set({ backgroundImage: image }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setClockColor: (color) => set({ clockColor: color }),
      setShowClockGlow: (show) => set({ showClockGlow: show }),
      setClockFormat: (format) => set({ clockFormat: format }),
      setShowSeconds: (show) => set({ showSeconds: show }),
      setClockPosition: (position) => set({ clockPosition: position }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "settings-store",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
