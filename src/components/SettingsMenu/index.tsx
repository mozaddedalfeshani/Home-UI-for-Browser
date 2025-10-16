"use client";

import { Settings, Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore, Theme } from "@/store/settingsStore";

const SettingsMenu = () => {
  const { setTheme } = useTheme();
  const {
    theme,
    autoOrderTabs,
    showClock,
    showRightSidebar,
    setTheme: setSettingsTheme,
    toggleAutoOrderTabs,
    toggleShowClock,
    toggleShowRightSidebar,
  } = useSettingsStore();

  const handleThemeChange = (newTheme: Theme) => {
    setSettingsTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
            aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Monitor className="mr-2 h-4 w-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          
          <DropdownMenuCheckboxItem
            checked={autoOrderTabs}
            onCheckedChange={toggleAutoOrderTabs}>
            Auto Order Tabs
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={showClock}
            onCheckedChange={toggleShowClock}>
            Show Clock
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={showRightSidebar}
            onCheckedChange={toggleShowRightSidebar}>
            Show Right Sidebar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SettingsMenu;
