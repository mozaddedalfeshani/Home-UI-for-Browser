"use client";

import { useState } from "react";
import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import Notepad from "@/components/Notepad";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import SearchModal from "@/components/SearchModal";
import { useSettingsStore } from "@/store/settingsStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaUrl } from "@/hooks/useMediaUrl";

export function PageClient() {
  const { showClock, showRightSidebar, backgroundImage, hasSeenWelcome, isHydrated, clockPosition, enableAISearch } = useSettingsStore();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onSearchModalOpen: () => setIsSearchModalOpen(true)
  });
  
  // Get the actual media URL
  const { url: backgroundImageUrl } = useMediaUrl(backgroundImage);

  // Show skeleton screen while store is hydrating
  if (!isHydrated) {
    return (
      <div 
        className="min-h-screen w-full"
        style={{
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: backgroundImageUrl ? undefined : undefined
        }}
      >
        <div className="h-screen w-full overflow-hidden">
          <div className="flex flex-row h-full">
            {/* Left side skeleton */}
            <div className="w-3/4 flex flex-col overflow-hidden">
              {/* Clock skeleton */}
              <div className={`flex justify-${clockPosition === 'top-left' ? 'start' : clockPosition === 'top-center' ? 'center' : 'end'} p-4`}>
                <div className="bg-muted/50 rounded-2xl p-8 animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              </div>
              
              {/* Tabs skeleton */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-4 animate-pulse">
                      <div className="h-12 w-12 bg-muted rounded-lg mx-auto mb-3"></div>
                      <div className="h-4 w-full bg-muted rounded mb-2"></div>
                      <div className="h-3 w-3/4 bg-muted rounded mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right sidebar skeleton */}
            <div className="w-1/4 overflow-hidden">
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
          </div>
          
          {/* Settings gear skeleton */}
          <div className="fixed bottom-6 right-6">
            <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: backgroundImageUrl ? undefined : undefined
      }}
    >
      <div className="flex flex-row h-screen overflow-hidden">
        {/* Left side */}
        <div className={`${showRightSidebar ? "w-3/4" : "w-full"} flex flex-col overflow-hidden`}>
          {/* Clock positioned within left side only */}
          {showClock && (
            <div className={`flex justify-${clockPosition === 'top-left' ? 'start' : clockPosition === 'top-center' ? 'center' : 'end'} p-4`}>
              <DigitalClock />
            </div>
          )}
          <TabsZone />
        </div>
        {/* Right side */}
        {showRightSidebar && (
          <div className="w-1/4 overflow-hidden">
            <Notepad />
          </div>
        )}
      </div>
      <SettingsMenu />
      {isHydrated && <WelcomeDialog open={!hasSeenWelcome} />}
      <SearchModal 
        open={isSearchModalOpen} 
        onOpenChange={setIsSearchModalOpen}
        enableAISearch={enableAISearch}
      />
    </div>
  );
}
