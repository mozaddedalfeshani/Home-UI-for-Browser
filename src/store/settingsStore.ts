import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mediaStorage } from "@/lib/mediaStorage";

import { Language } from "@/constants/languages";

export type Theme = "light" | "dark" | "system";
export type ClockPosition = "top-left" | "top-center" | "top-right";

interface SettingsState {
  theme: Theme;
  language: Language;
  autoOrderTabs: boolean;
  showClock: boolean;
  showRightSidebar: boolean;
  cardSize: number;
  cardRadius: number;
  backgroundImage: string | null;
  hasSeenWelcome: boolean;
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
  setBackgroundImage: (image: string | File | null) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => void;
  setClockColor: (color: string) => void;
  setShowClockGlow: (show: boolean) => void;
  setClockFormat: (format: '12h' | '24h') => void;
  setShowSeconds: (show: boolean) => void;
  setClockPosition: (position: ClockPosition) => void;
  setLanguage: (language: Language) => void;
  setHydrated: (hydrated: boolean) => void;
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
      cardSize: 7,
      cardRadius: 1.5,
      backgroundImage: null,
      hasSeenWelcome: false,
      clockColor: "#22c55e",
      showClockGlow: true,
      clockFormat: "24h",
      showSeconds: true,
      clockPosition: "top-left",
      enableAISearch: false,
      isHydrated: false,
      setTheme: (theme) => set({ theme }),
      toggleAutoOrderTabs: () => set((state) => ({ autoOrderTabs: !state.autoOrderTabs })),
      toggleShowClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleShowRightSidebar: () => set((state) => ({ showRightSidebar: !state.showRightSidebar })),
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
            console.error("Failed to store background image in IndexedDB:", error);
            
            // Check file size for fallback decision
            const maxDataUrlSize = 5 * 1024 * 1024; // 5MB limit for data URL
            
            if (image.size > maxDataUrlSize) {
              console.warn("File too large for data URL fallback, skipping background image");
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
              console.error("Failed to create data URL fallback:", fallbackError);
            }
          }
        } else {
          // If it's a string (data URL or media reference), store it directly
          set({ backgroundImage: image });
        }
      },
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      setClockColor: (color) => set({ clockColor: color }),
      setShowClockGlow: (show) => set({ showClockGlow: show }),
      setClockFormat: (format) => set({ clockFormat: format }),
      setShowSeconds: (show) => set({ showSeconds: show }),
      setClockPosition: (position) => set({ clockPosition: position }),
      setLanguage: (language) => set({ language }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      resetSettings: async () => {
        // Clear IndexedDB media storage
        try {
          await mediaStorage.clearAll();
        } catch (error) {
          console.error("Failed to clear media storage:", error);
        }
        
        set({
          theme: "system",
          language: "bn",
          autoOrderTabs: false,
          cardSize: 4,
          cardRadius: 0.5,
          backgroundImage: null,
          hasSeenWelcome: false,
          showClock: true,
          showRightSidebar: true,
          clockColor: "#ffffff",
          showClockGlow: true,
          clockFormat: "12h",
          showSeconds: true,
          clockPosition: "top-left",
          isHydrated: true,
        });
      },
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
