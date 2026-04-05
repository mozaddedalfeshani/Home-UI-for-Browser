"use client";

import { useState, useEffect } from "react";
import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import Notepad from "@/components/Notepad";
import SearchModal from "@/components/SearchModal";
import { useSettingsStore } from "@/store/settingsStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { useDefaultAssets } from "@/hooks/useDefaultAssets";
import Image from "next/image";
import GithubLink from "@/components/Home/GithubLink";
import { cn } from "@/lib/utils";

export function PageClient() {
  const {
    showClock,
    showRightSidebar,
    backgroundImage,
    isHydrated,
    clockPosition,
    layoutPreset,
    isDynamicWallpaper,
    dynamicWallpapers,
    setBackgroundImage,
  } = useSettingsStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Dynamic Wallpaper Logic: Pick a new one on every refresh
  useEffect(() => {
    if (isHydrated && isDynamicWallpaper && dynamicWallpapers.length > 0) {
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
          
          console.log("Fetching dynamic wallpaper:", selectedUrl);
          
          // Add a cache-busting timestamp to bypass aggressive browser/proxy caching
          const response = await fetch(`/api/proxy-wallpaper?url=${encodeURIComponent(selectedUrl)}&_t=${Date.now()}`);
          if (!response.ok) throw new Error("Failed to fetch through proxy");
          
          const blob = await response.blob();
          const filename = selectedUrl.split("/").pop() || "wallpaper.png";
          const file = new File([blob], filename, { type: blob.type });
          
          await setBackgroundImage(file);
          console.log("Dynamic wallpaper updated successfully to index:", randomIndex);
        } catch (error) {
          console.error("Error updating dynamic wallpaper:", error);
        }
      };
      
      fetchNewWallpaper();
    }
  }, [isHydrated, isDynamicWallpaper]); // Only run when hydrated or dynamic mode toggled

  const shouldShowRightSidebar = showRightSidebar && layoutPreset !== "focus";
  const leftPaneClass = shouldShowRightSidebar
    ? layoutPreset === "compact"
      ? "w-4/5"
      : "w-3/4"
    : "w-full";
  const rightPaneClass = layoutPreset === "compact" ? "w-1/5" : "w-1/4";
  const clockPaddingClass =
    layoutPreset === "compact"
      ? "pt-10 pb-2 px-2"
      : layoutPreset === "focus"
        ? "pt-24 pb-6 px-6"
        : "pt-16 pb-4 px-4";

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onSearchModalOpen: () => setIsSearchModalOpen(true),
  });
  // Ensure default background image on first visit
  useDefaultAssets();

  // Get the actual media URL
  const { url: backgroundImageUrl } = useMediaUrl(backgroundImage);

  // Show skeleton screen while store is hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full relative">
        {backgroundImageUrl && (
          <Image
            src={backgroundImageUrl}
            alt="Dashboard Background"
            fill
            priority
            className="object-cover -z-10"
            unoptimized={backgroundImageUrl.startsWith('blob:')}
          />
        )}
        <div className="h-screen w-full overflow-hidden">
          <div className="flex flex-row h-full">
            {/* Left side skeleton */}
            <div className={`${leftPaneClass} flex flex-col overflow-hidden`}>
              {/* Clock skeleton - Transparent to match new clock */}
              <div
                className={`flex justify-${clockPosition === "top-left" ? "start" : clockPosition === "top-center" ? "center" : "end"} ${clockPaddingClass}`}>
                <div className="p-0 animate-pulse">
                  <div className="h-20 w-48 bg-muted rounded-lg opacity-40"></div>
                </div>
              </div>

              {/* Tabs skeleton - Matching centered flex layout */}
              <div className="flex-1 p-6 flex flex-col items-center">
                <div className="flex justify-end w-full mb-6">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center w-full">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted/30 animate-pulse"
                      style={{ 
                        width: `${5}rem`,
                        height: `${5}rem`,
                        borderRadius: `${0.5}rem`
                      }}
                    >
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="h-8 w-8 bg-muted/50 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar skeleton - Conditional to match UI */}
            {shouldShowRightSidebar && (
              <div className={`${rightPaneClass} overflow-hidden`}>
                <div className="bg-muted/50 backdrop-blur-sm border-l border-border/60 h-full rounded-l-lg p-4 animate-pulse">
                  <div className="h-6 w-20 bg-muted rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                    <div className="h-4 w-4/5 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings gear skeleton */}
          <div className="fixed bottom-4 right-4">
            <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
        <GithubLink />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {backgroundImageUrl && (
        <Image
          src={backgroundImageUrl}
          alt="Dashboard Background"
          fill
          priority
          className="object-cover -z-10"
          unoptimized={backgroundImageUrl.startsWith('blob:')}
        />
      )}
      
      {/* Main Content (Always Centered) */}
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Clock positioned within left side only */}
          {showClock && (
            <div
              className={`flex justify-${clockPosition === "top-left" ? "start" : clockPosition === "top-center" ? "center" : "end"} ${clockPaddingClass}`}>
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
            isSidebarVisible ? "translate-x-0" : "translate-x-full"
          )}
          onMouseLeave={() => setIsSidebarVisible(false)}
        >
          <Notepad />
        </div>
      )}

      <SettingsMenu />
      <GithubLink />
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </div>
  );
}
