"use client";

import DigitalClock from "@/components/Home/ClockZone/Clock";
import TabsZone from "@/components/Home/TabsZone";
import SettingsMenu from "@/components/SettingsMenu";
import { useSettingsStore } from "@/store/settingsStore";

export function PageClient() {
  const { showClock, showRightSidebar, backgroundImage } = useSettingsStore();

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
          <div className="w-1/4 bg-blue-950">This is right side</div>
        )}
      </div>
      <SettingsMenu />
    </div>
  );
}
