"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export const useDefaultAssets = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setBackgroundImage, backgroundImage, isHydrated } = useSettingsStore();

  useEffect(() => {
    if (!isHydrated) return;

    const loadDefaultImage = async () => {
      // Only load default image if no background is set
      if (backgroundImage) return;

      // Check if default image is already cached in localStorage
      if (typeof window !== 'undefined' && localStorage.getItem('default-image-cached') === 'true') {
        return; // Already cached and set
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Downloading and caching default background image...");
        
        // Fetch the image directly
        const response = await fetch("/assets/image1.png");
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], "image1.png", { type: blob.type });
        
        // Set as background image using the existing File-based storage (goes to IndexedDB)
        await setBackgroundImage(file);
        
        // Mark as cached in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('default-image-cached', 'true');
        }
        
        console.log("Default background image cached and set successfully");
        
      } catch (err) {
        console.error("Failed to load default background image:", err);
        setError(err instanceof Error ? err.message : "Failed to load default image");
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultImage();
  }, [isHydrated, backgroundImage, setBackgroundImage]);

  return {
    isLoading,
    error,
    isDefaultImageCached: typeof window !== 'undefined' && localStorage.getItem('default-image-cached') === 'true'
  };
};
