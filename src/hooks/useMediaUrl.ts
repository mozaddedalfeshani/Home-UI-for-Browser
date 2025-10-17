"use client";

import { useState, useEffect } from "react";
import { mediaStorage } from "@/lib/mediaStorage";

export const useMediaUrl = (mediaRef: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mediaRef) {
      setUrl(null);
      return;
    }

    // If it's already a data URL, use it directly
    if (mediaRef.startsWith('data:')) {
      setUrl(mediaRef);
      return;
    }

    // If it's a media reference, fetch from IndexedDB
    if (mediaStorage.isMediaReference(mediaRef)) {
      setLoading(true);
      const id = mediaStorage.extractId(mediaRef);
      
      mediaStorage.getMedia(id)
        .then((data) => {
          setUrl(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load media:", error);
          setUrl(null);
          setLoading(false);
        });
    } else {
      // Fallback for other URL types
      setUrl(mediaRef);
    }
  }, [mediaRef]);

  return { url, loading };
};
