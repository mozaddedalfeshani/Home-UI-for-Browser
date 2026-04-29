"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

const DEFAULT_WALLPAPER_URL = "https://homewalpaper.imurad.me/1341419.png";

export const useDefaultAssets = () => {
  const { setBackgroundImage, backgroundImage, isHydrated } =
    useSettingsStore();

  useEffect(() => {
    if (!isHydrated) return;

    const loadDefault = async () => {
      try {
        // If a background already exists (from user choice or previous cache), skip.
        if (backgroundImage) return;

        await setBackgroundImage(DEFAULT_WALLPAPER_URL);
      } catch {
        // console.error("An error occurred during default asset initialization:", error);
      }
    };

    loadDefault();
  }, [isHydrated, backgroundImage, setBackgroundImage]);
};
