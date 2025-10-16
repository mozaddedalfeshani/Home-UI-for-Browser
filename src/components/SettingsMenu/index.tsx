"use client";

import { useState } from "react";
import { Settings, Monitor, Sun, Moon, Maximize2, Image as ImageIcon, Clock, Move } from "lucide-react";
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
import { ResizeShortcutsDialog } from "./ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./BackgroundImageDialog";
import { ClockColorDialog } from "./ClockColorDialog";
import { ClockPositionDialog } from "./ClockPositionDialog";

const SettingsMenu = () => {
  const { setTheme } = useTheme();
  const [resizeDialogOpen, setResizeDialogOpen] = useState(false);
  const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false);
  const [clockColorDialogOpen, setClockColorDialogOpen] = useState(false);
  const [clockPositionDialogOpen, setClockPositionDialogOpen] = useState(false);
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

  const handleThemeChange = (newTheme: string) => {
    const themeValue = newTheme as Theme;
    setSettingsTheme(themeValue);
    setTheme(themeValue);
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
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setResizeDialogOpen(true)}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Resize Shortcuts
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setBackgroundDialogOpen(true)}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Background Image
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setClockColorDialogOpen(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Clock Setting
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setClockPositionDialogOpen(true)}>
            <Move className="mr-2 h-4 w-4" />
            Clock Position
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ResizeShortcutsDialog 
        open={resizeDialogOpen} 
        onOpenChange={setResizeDialogOpen} 
      />
      
      <BackgroundImageDialog 
        open={backgroundDialogOpen} 
        onOpenChange={setBackgroundDialogOpen} 
      />
      
      <ClockColorDialog 
        open={clockColorDialogOpen} 
        onOpenChange={setClockColorDialogOpen} 
      />
      
      <ClockPositionDialog 
        open={clockPositionDialogOpen} 
        onOpenChange={setClockPositionDialogOpen} 
      />
    </div>
  );
};

export default SettingsMenu;
