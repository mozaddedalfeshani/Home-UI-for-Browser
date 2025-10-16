"use client";

import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import Notepad from "@/components/Notepad";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useSettingsStore } from "@/store/settingsStore";

export function PageClient() {
  const { showClock, showRightSidebar, backgroundImage, hasSeenWelcome, isHydrated } = useSettingsStore();

  // Show splash screen while store is hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">MCLX Home</h2>
          <p className="text-muted-foreground">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: backgroundImage ? undefined : undefined
      }}
    >
      <div className="flex flex-row min-h-screen p-6">
        {/* Left side */}
        <div className={showRightSidebar ? "w-3/4" : "w-full"}>
          {showClock && <DigitalClock />}
          <TabsZone />
        </div>
        {/* Right side */}
        {showRightSidebar && (
          <div className="w-1/4">
            <Notepad />
          </div>
        )}
      </div>
      <SettingsMenu />
      {isHydrated && <WelcomeDialog open={!hasSeenWelcome} />}
    </div>
  );
}
