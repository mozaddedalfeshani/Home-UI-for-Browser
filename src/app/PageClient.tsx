"use client";

import { useState } from "react";
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

export function PageClient() {
  const {
    showClock,
    showRightSidebar,
    backgroundImage,
    isHydrated,
    clockPosition,
    layoutPreset,
  } = useSettingsStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const shouldShowRightSidebar = showRightSidebar && layoutPreset !== "focus";
  const leftPaneClass = shouldShowRightSidebar
    ? layoutPreset === "compact"
      ? "w-4/5"
      : "w-3/4"
    : "w-full";
  const rightPaneClass = layoutPreset === "compact" ? "w-1/5" : "w-1/4";
  const clockPaddingClass =
    layoutPreset === "compact"
      ? "p-2"
      : layoutPreset === "focus"
        ? "p-6"
        : "p-4";

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
      <div className="flex flex-row h-screen overflow-hidden">
        {/* Left side */}
        <div className={`${leftPaneClass} flex flex-col overflow-hidden`}>
          {/* Clock positioned within left side only */}
          {showClock && (
            <div
              className={`flex justify-${clockPosition === "top-left" ? "start" : clockPosition === "top-center" ? "center" : "end"} ${clockPaddingClass}`}>
              <DigitalClock />
            </div>
          )}
          <TabsZone />
        </div>
        {/* Right side */}
        {shouldShowRightSidebar && (
          <div className={`${rightPaneClass} overflow-hidden`}>
            <Notepad />
          </div>
        )}
      </div>
      <SettingsMenu />
      <GithubLink />
      <SearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </div>
  );
}
