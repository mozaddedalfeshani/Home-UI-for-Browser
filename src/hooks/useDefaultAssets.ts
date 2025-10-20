"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

// Loads default background image on first visit and persists using IndexedDB via settingsStore
export const useDefaultAssets = () => {
  const { setBackgroundImage, backgroundImage, isHydrated } = useSettingsStore();

  useEffect(() => {
    if (!isHydrated) return;

    const loadDefault = async () => {
      try {
        if (backgroundImage) return;
        if (typeof window !== "undefined" && localStorage.getItem("default-image-cached") === "true") {
          return;
        }

        const res = await fetch("/assets/image1.png");
        if (!res.ok) return;
        const blob = await res.blob();
        const file = new File([blob], "image1.png", { type: blob.type });
        await setBackgroundImage(file);
        if (typeof window !== "undefined") {
          localStorage.setItem("default-image-cached", "true");
        }
      } catch (_) {
        // ignore
      }
    };

    loadDefault();
  }, [isHydrated, backgroundImage, setBackgroundImage]);
};


