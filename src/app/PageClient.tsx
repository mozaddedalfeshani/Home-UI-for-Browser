"use client";

import { useState, useEffect, useRef } from "react";
import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import Notepad from "@/components/Notepad";
import SearchModal from "@/components/SearchModal";
import MuradianAIModal from "@/components/MuradianAIModal";
import { useSettingsStore } from "@/store/settingsStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { useDefaultAssets } from "@/hooks/useDefaultAssets";
import { useStickyNoteAlarms } from "@/hooks/useStickyNoteAlarms";
import Image from "next/image";
import GithubLink from "@/components/Home/GithubLink";
import { cn } from "@/lib/utils";
import StickyAlarmDialog from "@/components/Notepad/StickyAlarmDialog";
import { useAuthStore } from "@/store/authStore";
import { AuthDialog } from "@/components/Auth/AuthDialog";

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

  const { url: backgroundImageUrl } = useMediaUrl(backgroundImage);
  const [bgOpacity, setBgOpacity] = useState(0);

  // Smooth Wallpaper Transition
  useEffect(() => {
    if (backgroundImageUrl) {
      setBgOpacity(0);
      const timer = setTimeout(() => setBgOpacity(1), 50);
      return () => clearTimeout(timer);
    }
  }, [backgroundImageUrl]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchOpenRequest, setSearchOpenRequest] = useState<SearchOpenRequest>(
    {
      id: 0,
      seedText: "",
    },
  );
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isMuradianModalOpen, setIsMuradianModalOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const hasPickedDynamicWallpaperRef = useRef(false);
  const isSearchModalOpenRef = useRef(false);
  const isMuradianModalOpenRef = useRef(false);
  const isAuthDialogOpenRef = useRef(false);
  const isSearchInputReadyRef = useRef(false);

  useEffect(() => {
    isSearchModalOpenRef.current = isSearchModalOpen;
  }, [isSearchModalOpen]);

  useEffect(() => {
    isMuradianModalOpenRef.current = isMuradianModalOpen;
  }, [isMuradianModalOpen]);

  useEffect(() => {
    isAuthDialogOpenRef.current = isAuthDialogOpen;
  }, [isAuthDialogOpen]);

  const handleSearchModalOpenChange = (nextOpen: boolean) => {
    isSearchModalOpenRef.current = nextOpen;
    isSearchInputReadyRef.current = false;
    setIsSearchModalOpen(nextOpen);

    if (!nextOpen) {
      setSearchOpenRequest((currentRequest) => ({
        id: currentRequest.id,
        seedText: "",
      }));
    }
  };

  // Dynamic Wallpaper Logic: Pick a new one on every refresh
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isDynamicWallpaper) {
      hasPickedDynamicWallpaperRef.current = false;
      return;
    }

    if (
      hasPickedDynamicWallpaperRef.current ||
      dynamicWallpapers.length === 0
    ) {
      return;
    }

    hasPickedDynamicWallpaperRef.current = true;

    const fetchNewWallpaper = async () => {
      try {
        // Use sessionStorage to keep track of the last index across refreshes in the same session
        const lastIndexStr = sessionStorage.getItem("lastWallpaperIndex");
        const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;

        let randomIndex;
        if (dynamicWallpapers.length > 1) {
          // Ensure we pick a DIFFERENT index than the last one if possible
          do {
            randomIndex = Math.floor(Math.random() * dynamicWallpapers.length);
          } while (randomIndex === lastIndex);
        } else {
          randomIndex = 0;
        }

        sessionStorage.setItem("lastWallpaperIndex", randomIndex.toString());
        const selectedUrl = dynamicWallpapers[randomIndex];

        await setBackgroundImage(selectedUrl);
      } catch {
        hasPickedDynamicWallpaperRef.current = false;
      }
    };

    fetchNewWallpaper();
  }, [
    dynamicWallpapers,
    isDynamicWallpaper,
    isHydrated,
    setBackgroundImage,
  ]);

  const shouldShowRightSidebar = showRightSidebar && layoutPreset !== "focus";
  const clockPaddingClass =
    layoutPreset === "compact"
      ? "pt-10 pb-2 px-2"
      : layoutPreset === "focus"
        ? "pt-24 pb-6 px-6"
        : "pt-16 pb-4 px-4";

  const { isAuthenticated, initCloudSession } = useAuthStore();

  // Restore cloud data once local stores are hydrated (silent, non-blocking)
  useEffect(() => {
    if (isHydrated) {
      initCloudSession();
    }
  }, [isHydrated, initCloudSession]);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onAIModalOpen: () => {
      if (isSearchModalOpenRef.current || isAuthDialogOpenRef.current) {
        return;
      }

      if (!isAuthenticated) {
        isAuthDialogOpenRef.current = true;
        setIsAuthDialogOpen(true);
        return;
      }

      isMuradianModalOpenRef.current = true;
      setIsMuradianModalOpen(true);
    },
    onSearchModalOpen: (initialQuery) => {
      if (isMuradianModalOpenRef.current || isAuthDialogOpenRef.current) {
        return;
      }

      if (initialQuery) {
        setSearchOpenRequest((currentRequest) => ({
          id: currentRequest.id + 1,
          seedText:
            isSearchModalOpenRef.current && !isSearchInputReadyRef.current
              ? `${currentRequest.seedText}${initialQuery}`
              : initialQuery,
        }));
      } else if (!isSearchModalOpenRef.current) {
        setSearchOpenRequest((currentRequest) => ({
          id: currentRequest.id + 1,
          seedText: "",
        }));
      }

      isSearchModalOpenRef.current = true;
      isSearchInputReadyRef.current = false;
      setIsSearchModalOpen(true);
    },
  });
  // Ensure default background image on first visit
  useDefaultAssets();
  // Keep sticky-note reminders active while dashboard tab is open
  useStickyNoteAlarms();

  const hasAutoOpenedRef = useRef(false);

  // Auto-focus search on visit
  useEffect(() => {
    if (isHydrated && !hasAutoOpenedRef.current && autoFocusSearch) {
      setIsSearchModalOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [isHydrated, autoFocusSearch]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {backgroundImageUrl && (
        <Image
          src={backgroundImageUrl}
          alt="Dashboard Background"
          fill
          priority
          className={cn(
            "object-cover -z-10 transition-opacity duration-1000",
            bgOpacity === 1 ? "opacity-100" : "opacity-0",
          )}
          unoptimized={backgroundImageUrl.startsWith("blob:")}
        />
      )}

      {/* Main Content (Always Centered) */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Clock positioned within left side only */}
          {showClock && (
            <div
              className={`flex justify-${clockPosition === "top-left" ? "start" : clockPosition === "top-center" ? "center" : "end"} ${clockPaddingClass}`}
            >
              <DigitalClock />
            </div>
          )}
          <TabsZone />
        </div>
      </div>

      {/* Sidebar Hover Trigger Zone (Far Right) */}
      {shouldShowRightSidebar && !isSidebarVisible && (
        <div
          className="fixed right-0 top-0 bottom-0 w-8 z-40 cursor-w-resize"
          onMouseEnter={() => setIsSidebarVisible(true)}
        />
      )}

      {/* Sidebar Overlay */}
      {shouldShowRightSidebar && (
        <div
          className={cn(
            "fixed right-0 top-0 bottom-0 w-80 md:w-96 z-50 transform transition-all duration-500 ease-out",
            isSidebarVisible ? "translate-x-0" : "translate-x-full",
          )}
          onMouseLeave={() => setIsSidebarVisible(false)}
        >
          <Notepad />
        </div>
      )}

      {/* Search Hover Zone (Bottom Center) */}
      {enableSearchHoverZone && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 h-16 w-64 z-40 cursor-pointer"
          onMouseEnter={() => {
            if (
              !isSearchModalOpenRef.current &&
              !isMuradianModalOpenRef.current &&
              !isAuthDialogOpenRef.current
            ) {
              setSearchOpenRequest((currentRequest) => ({
                id: currentRequest.id + 1,
                seedText: "",
              }));
              isSearchModalOpenRef.current = true;
              isSearchInputReadyRef.current = false;
              setIsSearchModalOpen(true);
            }
          }}
        />
      )}

      <SettingsMenu />
      <GithubLink />
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={handleSearchModalOpenChange}
        openRequest={searchOpenRequest}
        onInputReady={() => {
          isSearchInputReadyRef.current = true;
        }}
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
