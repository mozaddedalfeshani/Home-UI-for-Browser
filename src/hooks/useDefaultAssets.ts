"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

const DEFAULT_WALLPAPER_URL = "https://homewalpaper.imurad.me/1341419.png";
const CACHE_KEY = "default-wallpaper-cached-v4"; // Versioned cache key

export const useDefaultAssets = () => {
  const { setBackgroundImage, backgroundImage, isHydrated } = useSettingsStore();

  useEffect(() => {
    if (!isHydrated) return;

    const loadDefault = async () => {
      try {
        // If a background already exists (from user choice or previous cache), skip.
        if (backgroundImage) return;

        // Extra guard to prevent multiple downloads in the same session
        if (typeof window !== "undefined" && localStorage.getItem(CACHE_KEY) === "true") {
          return;
        }

        console.log("Fetching live default wallpaper via proxy...");
        // Use the proxy-wallpaper API to bypass CORS restrictions
        const proxyUrl = `/api/proxy-wallpaper?url=${encodeURIComponent(DEFAULT_WALLPAPER_URL)}`;
        const res = await fetch(proxyUrl);
        
        if (!res.ok) {
            console.error("Failed to fetch default wallpaper via proxy:", res.statusText);
            return;
        }

        const blob = await res.blob();
        
        // Ensure we have a valid image blob
        if (!blob.type.startsWith('image/')) {
            console.error("Fetched file is not a valid image");
            return;
        }

        const file = new File([blob], "default_wallpaper.png", { type: blob.type });
        
        // This will automatically handle storage in IndexedDB via the store's setBackgroundImage
        await setBackgroundImage(file);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEY, "true");
          console.log("Default wallpaper successfully cached via proxy.");
        }
      } catch (error) {
        console.error("An error occurred during default asset initialization:", error);
      }
    };

    loadDefault();
  }, [isHydrated, backgroundImage, setBackgroundImage]);
};
