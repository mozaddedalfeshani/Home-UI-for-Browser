"use client";

import { useState, useEffect, useRef } from "react";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import Notepad from "@/components/Notepad";
import SearchModal from "@/components/SearchModal";
import MuradianAIModal from "@/components/MuradianAIModal";
import StickyAlarmDialog from "@/components/Notepad/StickyAlarmDialog";
import { AuthDialog } from "@/components/Auth/AuthDialog";
import GithubLink from "@/components/Home/GithubLink";
import { normalizeDynamicWallpaper, useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { useDefaultAssets } from "@/hooks/useDefaultAssets";
import { useStickyNoteAlarms } from "@/hooks/useStickyNoteAlarms";
import { useTheme } from "next-themes";
import { BackgroundLayer } from "./_components/BackgroundLayer";
import { ClockSection } from "./_components/ClockSection";
import { SidebarOverlay } from "./_components/SidebarOverlay";
import { SearchHoverZone } from "./_components/SearchHoverZone";

type SearchOpenRequest = {
  id: number;
  seedText: string;
};

export function PageClient() {
  const {
    showClock,
    showRightSidebar,
    enableSearchHoverZone,
    backgroundImage,
    isHydrated,
    clockPosition,
    layoutPreset,
    isDynamicWallpaper,
    dynamicWallpapers,
    autoFocusSearch,
    setBackgroundImage,
  } = useSettingsStore();
  const { resolvedTheme } = useTheme();
  const activeWallpaperTheme = resolvedTheme === "dark" ? "dark" : "light";

  const { url: backgroundImageUrl } = useMediaUrl(backgroundImage);
  const [bgOpacity, setBgOpacity] = useState(0);

  useEffect(() => {
    if (backgroundImageUrl) {
      setBgOpacity(0);
      const timer = setTimeout(() => setBgOpacity(1), 50);
      return () => clearTimeout(timer);
    }
  }, [backgroundImageUrl]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchOpenRequest, setSearchOpenRequest] = useState<SearchOpenRequest>({ id: 0, seedText: "" });
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMuradianModalOpen, setIsMuradianModalOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const hasPickedDynamicWallpaperRef = useRef(false);
  const lastDynamicWallpaperThemeRef = useRef<string | null>(null);
  const isSearchModalOpenRef = useRef(false);
  const isMuradianModalOpenRef = useRef(false);
  const isAuthDialogOpenRef = useRef(false);
  const isSearchInputReadyRef = useRef(false);

  useEffect(() => { isSearchModalOpenRef.current = isSearchModalOpen; }, [isSearchModalOpen]);
  useEffect(() => { isMuradianModalOpenRef.current = isMuradianModalOpen; }, [isMuradianModalOpen]);
  useEffect(() => { isAuthDialogOpenRef.current = isAuthDialogOpen; }, [isAuthDialogOpen]);

  const handleSearchModalOpenChange = (nextOpen: boolean) => {
    isSearchModalOpenRef.current = nextOpen;
    isSearchInputReadyRef.current = false;
    setIsSearchModalOpen(nextOpen);
    if (!nextOpen) {
      setSearchOpenRequest((r) => ({ id: r.id, seedText: "" }));
    }
  };

  useEffect(() => {
    if (!isHydrated || !isDynamicWallpaper) {
      if (!isDynamicWallpaper) {
        hasPickedDynamicWallpaperRef.current = false;
        lastDynamicWallpaperThemeRef.current = null;
      }
      return;
    }

    if (hasPickedDynamicWallpaperRef.current && lastDynamicWallpaperThemeRef.current === activeWallpaperTheme) return;

    const normalizedWallpapers = dynamicWallpapers.map(normalizeDynamicWallpaper);
    const themeWallpapers = normalizedWallpapers.filter(
      (w) => w.mode === "both" || w.mode === activeWallpaperTheme,
    );
    const available = themeWallpapers.length > 0 ? themeWallpapers : normalizedWallpapers;
    if (available.length === 0) return;

    hasPickedDynamicWallpaperRef.current = true;
    lastDynamicWallpaperThemeRef.current = activeWallpaperTheme;

    const fetchNewWallpaper = async () => {
      try {
        const lastIndexStr = sessionStorage.getItem("lastWallpaperIndex");
        const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
        let randomIndex = 0;
        if (available.length > 1) {
          do { randomIndex = Math.floor(Math.random() * available.length); } while (randomIndex === lastIndex);
        }
        sessionStorage.setItem("lastWallpaperIndex", randomIndex.toString());
        await setBackgroundImage(available[randomIndex].url);
      } catch {
        hasPickedDynamicWallpaperRef.current = false;
        lastDynamicWallpaperThemeRef.current = null;
      }
    };

    fetchNewWallpaper();
  }, [activeWallpaperTheme, dynamicWallpapers, isDynamicWallpaper, isHydrated, setBackgroundImage]);

  const shouldShowRightSidebar = showRightSidebar && layoutPreset !== "focus";

  const { isAuthenticated, initCloudSession } = useAuthStore();

  useEffect(() => {
    if (isHydrated) initCloudSession();
  }, [isHydrated, initCloudSession]);

  useKeyboardShortcuts({
    onAIModalOpen: () => {
      if (isSearchModalOpenRef.current || isAuthDialogOpenRef.current) return;
      if (!isAuthenticated) {
        isAuthDialogOpenRef.current = true;
        setIsAuthDialogOpen(true);
        return;
      }
      isMuradianModalOpenRef.current = true;
      setIsMuradianModalOpen(true);
    },
    onSearchModalOpen: (initialQuery) => {
      if (isMuradianModalOpenRef.current || isAuthDialogOpenRef.current) return;
      if (initialQuery) {
        setSearchOpenRequest((r) => ({
          id: r.id + 1,
          seedText:
            isSearchModalOpenRef.current && !isSearchInputReadyRef.current
              ? `${r.seedText}${initialQuery}`
              : initialQuery,
        }));
      } else if (!isSearchModalOpenRef.current) {
        setSearchOpenRequest((r) => ({ id: r.id + 1, seedText: "" }));
      }
      isSearchModalOpenRef.current = true;
      isSearchInputReadyRef.current = false;
      setIsSearchModalOpen(true);
    },
  });

  useDefaultAssets();
  useStickyNoteAlarms();

  const hasAutoOpenedRef = useRef(false);
  useEffect(() => {
    if (isHydrated && !hasAutoOpenedRef.current && autoFocusSearch) {
      setIsSearchModalOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [isHydrated, autoFocusSearch]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackgroundLayer url={backgroundImageUrl} opacity={bgOpacity} />

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {showClock && (
            <ClockSection clockPosition={clockPosition} layoutPreset={layoutPreset} />
          )}
          <TabsZone />
        </div>
      </div>

      {shouldShowRightSidebar && (
        <SidebarOverlay
          isVisible={isSidebarVisible}
          onMouseEnter={() => setIsSidebarVisible(true)}
          onMouseLeave={() => setIsSidebarVisible(false)}
        />
      )}

      {enableSearchHoverZone && (
        <SearchHoverZone
          onEnter={() => {
            if (isSearchModalOpenRef.current || isMuradianModalOpenRef.current || isAuthDialogOpenRef.current) return;
            setSearchOpenRequest((r) => ({ id: r.id + 1, seedText: "" }));
            isSearchModalOpenRef.current = true;
            isSearchInputReadyRef.current = false;
            setIsSearchModalOpen(true);
          }}
        />
      )}

      <SettingsMenu />
      <GithubLink />

      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={handleSearchModalOpenChange}
        openRequest={searchOpenRequest}
        onInputReady={() => { isSearchInputReadyRef.current = true; }}
      />
      <MuradianAIModal
        open={isAuthenticated && isMuradianModalOpen}
        onOpenChange={(nextOpen) => {
          isMuradianModalOpenRef.current = nextOpen;
          setIsMuradianModalOpen(nextOpen);
        }}
      />
      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={(nextOpen) => {
          isAuthDialogOpenRef.current = nextOpen;
          setIsAuthDialogOpen(nextOpen);
        }}
      />
      <StickyAlarmDialog />
    </div>
  );
}
