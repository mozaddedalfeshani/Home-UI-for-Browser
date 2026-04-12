import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mediaStorage } from "@/lib/mediaStorage";
import {
  SHARE_SETTINGS_DEFAULTS,
  type ShareProfileSettings,
} from "@/lib/shareProfile";

import { Language } from "@/constants/languages";

export type Theme = "light" | "dark" | "system";
export type ClockPosition = "top-left" | "top-center" | "top-right";
export type SearchEngine = "google" | "duckduckgo" | "bing" | "brave";
export type LayoutPreset = "default" | "compact" | "focus";
export type ClockStyle = "classic" | "modern";
export type TabsPosition = "top" | "center" | "bottom";

export const DEFAULT_DYNAMIC_WALLPAPERS = [
  "https://homewalpaper.imurad.me/1351306.png",
  "https://homewalpaper.imurad.me/1362858.jpeg",
  "https://homewalpaper.imurad.me/573653.jpg",
];

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
  isDynamicWallpaper: boolean;
  dynamicWallpapers: string[];
  alarmSoundRef: string | null;
  setTheme: (theme: Theme) => void;
  toggleAutoOrderTabs: () => void;
  toggleShowClock: () => void;
  toggleShowRightSidebar: () => void;
  setShowRightSidebar: (show: boolean) => void;
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
  setDynamicWallpaper: (enabled: boolean) => void;
  ensureAlarmSoundCached: () => Promise<string | null>;
  getShareableSettings: () => ShareProfileSettings;
  applyShareProfileSettings: (settings: ShareProfileSettings) => void;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: SHARE_SETTINGS_DEFAULTS.theme,
      language: SHARE_SETTINGS_DEFAULTS.language,
      autoOrderTabs: SHARE_SETTINGS_DEFAULTS.autoOrderTabs,
      showClock: SHARE_SETTINGS_DEFAULTS.showClock,
      showRightSidebar: SHARE_SETTINGS_DEFAULTS.showRightSidebar,
      tabsPosition: SHARE_SETTINGS_DEFAULTS.tabsPosition,
      cardSize: SHARE_SETTINGS_DEFAULTS.cardSize,
      cardRadius: SHARE_SETTINGS_DEFAULTS.cardRadius,
      backgroundImage: null,
      clockColor: SHARE_SETTINGS_DEFAULTS.clockColor,
      showClockGlow: SHARE_SETTINGS_DEFAULTS.showClockGlow,
      clockFormat: SHARE_SETTINGS_DEFAULTS.clockFormat,
      showSeconds: SHARE_SETTINGS_DEFAULTS.showSeconds,
      searchEngine: SHARE_SETTINGS_DEFAULTS.searchEngine,
      layoutPreset: SHARE_SETTINGS_DEFAULTS.layoutPreset,
      clockPosition: SHARE_SETTINGS_DEFAULTS.clockPosition,
      clockStyle: SHARE_SETTINGS_DEFAULTS.clockStyle,
      enableAISearch: false,
      isHydrated: false,
      isClockDialogOpen: false,
      isBackgroundDialogOpen: false,
      isResizeDialogOpen: false,
      isDynamicWallpaper: SHARE_SETTINGS_DEFAULTS.isDynamicWallpaper,
      dynamicWallpapers: DEFAULT_DYNAMIC_WALLPAPERS,
      alarmSoundRef: null,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () =>
        set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () =>
        set((state) => ({ showRightSidebar: !state.showRightSidebar })),
      setShowRightSidebar: (show) => set({ showRightSidebar: show }),
      setCardSize: (size) => set({ cardSize: size }),
      setCardRadius: (radius) => set({ cardRadius: radius }),
      setBackgroundImage: async (image) => {
        // console.log("Setting background image in store:", image);

        // If it's a File object, store it in IndexedDB
        if (image instanceof File) {
          try {
            const id = mediaStorage.generateId();
            const mediaRef = await mediaStorage.storeMedia(id, image);
            set({ backgroundImage: mediaRef });
            // console.log("Background image stored in IndexedDB:", mediaRef);
          } catch {
            // console.error(
            //   "Failed to store background image in IndexedDB:",
            //   error,
            // );

            // Check file size for fallback decision
            const maxDataUrlSize = 5 * 1024 * 1024; // 5MB limit for data URL

            if (image.size > maxDataUrlSize) {
              // console.warn(
              //   "File too large for data URL fallback, skipping background image",
              // );
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
              // console.log("Background image stored as data URL fallback");
            } catch {
              // console.error(
              //   "Failed to create data URL fallback:",
              //   fallbackError,
              // );
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
      setDynamicWallpaper: (enabled) => set({ isDynamicWallpaper: enabled }),
      ensureAlarmSoundCached: async () => {
        const existingRef = get().alarmSoundRef;
        if (existingRef) {
          return existingRef;
        }

        try {
          const response = await fetch("/video/alarmsounds.mp3");
          if (!response.ok) {
            throw new Error(`Failed to fetch alarm sound: ${response.status}`);
          }

          const blob = await response.blob();
          const file = new File([blob], "alarmsounds.mp3", {
            type: blob.type || "audio/mpeg",
          });
          const mediaId = mediaStorage.generateId();
          const mediaRef = await mediaStorage.storeMedia(mediaId, file);
          set({ alarmSoundRef: mediaRef });
          return mediaRef;
        } catch {
          // console.error("Failed to cache alarm sound:", error);
          return null;
        }
      },
      getShareableSettings: () => {
        const state = get();
        return {
          theme: state.theme,
          language: state.language,
          autoOrderTabs: state.autoOrderTabs,
          showClock: state.showClock,
          showRightSidebar: state.showRightSidebar,
          tabsPosition: state.tabsPosition,
          cardSize: state.cardSize,
          cardRadius: state.cardRadius,
          clockColor: state.clockColor,
          showClockGlow: state.showClockGlow,
          clockFormat: state.clockFormat,
          showSeconds: state.showSeconds,
          searchEngine: state.searchEngine,
          layoutPreset: state.layoutPreset,
          clockPosition: state.clockPosition,
          clockStyle: state.clockStyle,
          isDynamicWallpaper: state.isDynamicWallpaper,
        };
      },
      applyShareProfileSettings: (settings) =>
        set({
          theme: settings.theme,
          language: settings.language,
          autoOrderTabs: settings.autoOrderTabs,
          showClock: settings.showClock,
          showRightSidebar: settings.showRightSidebar,
          tabsPosition: settings.tabsPosition,
          cardSize: settings.cardSize,
          cardRadius: settings.cardRadius,
          clockColor: settings.clockColor,
          showClockGlow: settings.showClockGlow,
          clockFormat: settings.clockFormat,
          showSeconds: settings.showSeconds,
          searchEngine: settings.searchEngine,
          layoutPreset: settings.layoutPreset,
          clockPosition: settings.clockPosition,
          clockStyle: settings.clockStyle,
          isDynamicWallpaper: settings.isDynamicWallpaper,
        }),
      resetSettings: async () => {
        set({
          theme: SHARE_SETTINGS_DEFAULTS.theme,
          language: SHARE_SETTINGS_DEFAULTS.language,
          autoOrderTabs: SHARE_SETTINGS_DEFAULTS.autoOrderTabs,
          cardSize: SHARE_SETTINGS_DEFAULTS.cardSize,
          cardRadius: SHARE_SETTINGS_DEFAULTS.cardRadius,
          backgroundImage: null,
          showClock: SHARE_SETTINGS_DEFAULTS.showClock,
          showRightSidebar: SHARE_SETTINGS_DEFAULTS.showRightSidebar,
          tabsPosition: SHARE_SETTINGS_DEFAULTS.tabsPosition,
          isDynamicWallpaper: SHARE_SETTINGS_DEFAULTS.isDynamicWallpaper,
          clockColor: SHARE_SETTINGS_DEFAULTS.clockColor,
          showClockGlow: SHARE_SETTINGS_DEFAULTS.showClockGlow,
          clockFormat: SHARE_SETTINGS_DEFAULTS.clockFormat,
          showSeconds: SHARE_SETTINGS_DEFAULTS.showSeconds,
          searchEngine: SHARE_SETTINGS_DEFAULTS.searchEngine,
          layoutPreset: SHARE_SETTINGS_DEFAULTS.layoutPreset,
          clockPosition: SHARE_SETTINGS_DEFAULTS.clockPosition,
          clockStyle: SHARE_SETTINGS_DEFAULTS.clockStyle,
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
        const persistedState = { ...state } as Record<string, unknown>;
        delete persistedState.isClockDialogOpen;
        delete persistedState.isBackgroundDialogOpen;
        delete persistedState.isResizeDialogOpen;
        delete persistedState.setClockDialogOpen;
        delete persistedState.setBackgroundDialogOpen;
        delete persistedState.setResizeDialogOpen;
        return persistedState as Partial<SettingsState>;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
