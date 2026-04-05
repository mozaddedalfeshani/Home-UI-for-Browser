import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mediaStorage } from "@/lib/mediaStorage";

import { Language } from "@/constants/languages";

export type Theme = "light" | "dark" | "system";
export type ClockPosition = "top-left" | "top-center" | "top-right";
export type SearchEngine = "google" | "duckduckgo" | "bing" | "brave";
export type LayoutPreset = "default" | "compact" | "focus";
export type ClockStyle = "classic" | "modern";
export type TabsPosition = "top" | "center" | "bottom";

interface SettingsState {
  theme: Theme;
  language: Language;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  tabsPosition: TabsPosition;
  cardSize: number;
  cardRadius: number;
  backgroundImage: string | null;
  clockColor: string;
  showClockGlow: boolean;
  clockFormat: "12h" | "24h";
  showSeconds: boolean;
  searchEngine: SearchEngine;
  layoutPreset: LayoutPreset;
  clockPosition: ClockPosition;
  clockStyle: ClockStyle;
  isHydrated: boolean;
  // UI Dialog States (Non-persistent)
  isClockDialogOpen: boolean;
  isBackgroundDialogOpen: boolean;
  isResizeDialogOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleAutoOrderTabs: () => void;
  toggleShowClock: () => void;
  toggleShowRightSidebar: () => void;
  setCardSize: (size: number) => void;
  setCardRadius: (radius: number) => void;
  setBackgroundImage: (image: string | File | null) => Promise<void>;
  setClockColor: (color: string) => void;
  setShowClockGlow: (show: boolean) => void;
  setClockFormat: (format: "12h" | "24h") => void;
  setShowSeconds: (show: boolean) => void;
  setSearchEngine: (engine: SearchEngine) => void;
  setLayoutPreset: (preset: LayoutPreset) => void;
  setClockPosition: (position: ClockPosition) => void;
  setClockStyle: (style: ClockStyle) => void;
  setLanguage: (language: Language) => void;
  setHydrated: (hydrated: boolean) => void;
  setClockDialogOpen: (open: boolean) => void;
  setBackgroundDialogOpen: (open: boolean) => void;
  setResizeDialogOpen: (open: boolean) => void;
  setTabsPosition: (position: TabsPosition) => void;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "bn",
      autoOrderTabs: false,
      showClock: true,
      showRightSidebar: true,
      tabsPosition: "center",
      cardSize: 5,
      cardRadius: 0.5,
      backgroundImage: null,
      clockColor: "#eab308",
      showClockGlow: false,
      clockFormat: "12h",
      showSeconds: false,
      searchEngine: "google",
      layoutPreset: "default",
      clockPosition: "top-center",
      clockStyle: "classic",
      enableAISearch: false,
      isHydrated: false,
      isClockDialogOpen: false,
      isBackgroundDialogOpen: false,
      isResizeDialogOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () =>
        set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () =>
        set((state) => ({ showRightSidebar: !state.showRightSidebar })),
      setCardSize: (size) => set({ cardSize: size }),
      setCardRadius: (radius) => set({ cardRadius: radius }),
      setBackgroundImage: async (image) => {
        console.log("Setting background image in store:", image);

        // If it's a File object, store it in IndexedDB
        if (image instanceof File) {
          try {
            const id = mediaStorage.generateId();
            const mediaRef = await mediaStorage.storeMedia(id, image);
            set({ backgroundImage: mediaRef });
            console.log("Background image stored in IndexedDB:", mediaRef);
          } catch (error) {
            console.error(
              "Failed to store background image in IndexedDB:",
              error,
            );

            // Check file size for fallback decision
            const maxDataUrlSize = 5 * 1024 * 1024; // 5MB limit for data URL

            if (image.size > maxDataUrlSize) {
              console.warn(
                "File too large for data URL fallback, skipping background image",
              );
              // Don't set the background image if it's too large for data URL
              return;
            }

            // Fallback to data URL if IndexedDB fails and file is small enough
            try {
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(image);
              });
              set({ backgroundImage: dataUrl });
              console.log("Background image stored as data URL fallback");
            } catch (fallbackError) {
              console.error(
                "Failed to create data URL fallback:",
                fallbackError,
              );
            }
          }
        } else {
          // If it's a string (data URL or media reference), store it directly
          set({ backgroundImage: image });
        }
      },
      setClockColor: (color) => set({ clockColor: color }),
      setShowClockGlow: (show) => set({ showClockGlow: show }),
      setClockFormat: (format) => set({ clockFormat: format }),
      setShowSeconds: (show) => set({ showSeconds: show }),
      setSearchEngine: (engine) => set({ searchEngine: engine }),
      setLayoutPreset: (preset) => set({ layoutPreset: preset }),
      setClockPosition: (position) => set({ clockPosition: position }),
      setClockStyle: (style) => set({ clockStyle: style }),
      setLanguage: (language) => set({ language }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setClockDialogOpen: (open) => set({ isClockDialogOpen: open }),
      setBackgroundDialogOpen: (open) => set({ isBackgroundDialogOpen: open }),
      setResizeDialogOpen: (open) => set({ isResizeDialogOpen: open }),
      setTabsPosition: (position) => set({ tabsPosition: position }),
      resetSettings: async () => {
        set({
          theme: "system",
          language: "bn",
          autoOrderTabs: false,
          cardSize: 5,
          cardRadius: 0.5,
          backgroundImage: null,
          showClock: true,
          showRightSidebar: true,
          tabsPosition: "center",
          clockColor: "#eab308",
          showClockGlow: false,
          clockFormat: "12h",
          showSeconds: false,
          searchEngine: "google",
          layoutPreset: "default",
          clockPosition: "top-center",
          clockStyle: "classic",
          isHydrated: true,
          isClockDialogOpen: false,
          isBackgroundDialogOpen: false,
          isResizeDialogOpen: false,
        });
      },
    }),
    {
      name: "settings-store",
      version: 1,
      partialize: (state) => {
        const {
          isClockDialogOpen,
          isBackgroundDialogOpen,
          isResizeDialogOpen,
          setClockDialogOpen,
          setBackgroundDialogOpen,
          setResizeDialogOpen,
          ...persistedState
        } = state;
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
