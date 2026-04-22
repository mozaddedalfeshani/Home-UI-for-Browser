"use client";

import { useState } from "react";
import {
  Settings,
  Monitor,
  Sun,
  Moon,
  Maximize2,
  Image as ImageIcon,
  Clock,
  RotateCcw,
  History,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchEngine,
  TabsPosition,
  useSettingsStore,
  Theme,
} from "@/store/settingsStore";
import { Language, useTranslation } from "@/constants/languages";
import { ResizeShortcutsDialog } from "./ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./BackgroundImageDialog";
import { ClockColorDialog } from "./ClockColorDialog";
import { HistoryDialog } from "./HistoryDialog";
import { ResetDialog } from "./ResetDialog";
import { ProfileDialog } from "./ProfileDialog";

const SettingsMenu = () => {
  const { setTheme } = useTheme();
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const {
    theme,
    language,
    autoOrderTabs,
    showRightSidebar,
    enableLeftSidebarHover,
    enableSearchHoverZone,
    autoFocusSearch,
    searchEngine,
    tabsPosition,
    isClockDialogOpen,
    isBackgroundDialogOpen,
    isResizeDialogOpen,
    isDynamicWallpaper,
    setTheme: setSettingsTheme,
    setLanguage,
    setSearchEngine,
    setTabsPosition,
    setDynamicWallpaper,
    toggleAutoOrderTabs,
    toggleShowRightSidebar,
    toggleLeftSidebarHover,
    toggleSearchHoverZone,
    toggleAutoFocusSearch,
    setClockDialogOpen,
    setBackgroundDialogOpen,
    setResizeDialogOpen,
  } = useSettingsStore();

  const handleThemeChange = (newTheme: string) => {
    const themeValue = newTheme as Theme;
    setSettingsTheme(themeValue);
    setTheme(themeValue);
  };

  const handleLanguageChange = (newLanguage: string) => {
    const languageValue = newLanguage as Language;
    setLanguage(languageValue);
  };

  const handleSearchEngineChange = (newEngine: string) => {
    setSearchEngine(newEngine as SearchEngine);
  };

  // Translation function
  const t = useTranslation(language);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
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
        <DropdownMenuContent align="end" className="w-[300px] p-2">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("settings")}
            </span>
            <ResetDialog>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                aria-label="Reset settings">
                <RotateCcw className="h-3 w-3" />
              </Button>
            </ResetDialog>
          </div>
          <DropdownMenuSeparator />

          {/* Theme & Language Row */}
          <div className="grid grid-cols-2 gap-2 p-1">
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("theme")}
              </span>
              <div className="flex items-center justify-between gap-1">
                <Button
                  variant={theme === "light" ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="h-8 w-8"
                  onClick={() => handleThemeChange("light")}
                  aria-label={t("light")}
                  title={t("light")}>
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="h-8 w-8"
                  onClick={() => handleThemeChange("dark")}
                  aria-label={t("dark")}
                  title={t("dark")}>
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "secondary" : "ghost"}
                  size="icon-sm"
                  className="h-8 w-8"
                  onClick={() => handleThemeChange("system")}
                  aria-label={t("system")}
                  title={t("system")}>
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("language")}
              </span>
              <div className="flex h-8 items-center rounded-md border border-border/50 bg-background/50 p-0.5">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold transition-all",
                    language === "en"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent",
                  )}>
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange("bn")}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold transition-all",
                    language === "bn"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent",
                  )}>
                  BN
                </button>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Search Engine Selection */}
          <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">
              {t("searchEngine")}
            </span>
            <div className="grid grid-cols-4 gap-1">
              {["google", "duckduckgo", "bing", "brave"].map((engine) => (
                <Button
                  key={engine}
                  variant={searchEngine === engine ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-0 text-[10px] capitalize"
                  onClick={() => handleSearchEngineChange(engine)}>
                  {engine === "duckduckgo" ? "DDG" : engine}
                </Button>
              ))}
            </div>
          </div>

          {/* Layout Selection */}
          {/* <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">
              {t("layoutMode")}
            </span>
            <div className="flex rounded-md border border-border/50 bg-background/50 p-0.5">
              {["default", "compact", "focus"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleLayoutPresetChange(preset)}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold capitalize transition-all",
                    layoutPreset === preset
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent",
                  )}>
                  {t(
                    `layout${preset.charAt(0).toUpperCase() + preset.slice(1)}`,
                  )}
                </button>
              ))}
            </div>
          </div> */}

          {/* Shortcut Position Selection */}
          <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">
              {t("shortcutPosition")}
            </span>
            <div className="flex rounded-md border border-border/50 bg-background/50 p-0.5">
              {["top", "center"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setTabsPosition(pos as TabsPosition)}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold capitalize transition-all",
                    tabsPosition === pos
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent",
                  )}>
                  {t(pos)}
                </button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Toggles Group */}
          <div className="space-y-1 p-1">
            {[
              {
                id: "autoOrderTabs",
                label: t("autoOrderTabs"),
                checked: autoOrderTabs,
                onCheckedChange: toggleAutoOrderTabs,
              },
              {
                id: "showRightSidebar",
                label: t("showRightSidebar"),
                checked: showRightSidebar,
                onCheckedChange: toggleShowRightSidebar,
              },
              {
                id: "enableLeftSidebarHover",
                label: t("enableLeftSidebarHover"),
                checked: enableLeftSidebarHover,
                onCheckedChange: toggleLeftSidebarHover,
              },
              {
                id: "enableSearchHoverZone",
                label: t("enableSearchHoverZone"),
                checked: enableSearchHoverZone,
                onCheckedChange: toggleSearchHoverZone,
              },
              {
                id: "dynamicWallpaper",
                label: t("dynamicWallpaper"),
                checked: isDynamicWallpaper,
                onCheckedChange: () => setDynamicWallpaper(!isDynamicWallpaper),
              },
              {
                id: "autoFocusSearch",
                label: t("autoFocusSearch"),
                checked: autoFocusSearch,
                onCheckedChange: toggleAutoFocusSearch,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent/50">
                <span className="text-[11px] font-medium">{item.label}</span>
                <button
                  onClick={item.onCheckedChange}
                  className={cn(
                    "relative h-4 w-8 rounded-full transition-colors",
                    item.checked ? "bg-primary" : "bg-muted",
                  )}>
                  <div
                    className={cn(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all",
                      item.checked ? "translate-x-4" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-1 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResizeDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              {t("resizeShortcuts")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              {t("history")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBackgroundDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {t("backgroundImage")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {t("profileShare")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClockDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal col-span-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Digital Clock Settings
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResizeShortcutsDialog
        open={isResizeDialogOpen}
        onOpenChange={setResizeDialogOpen}
      />

      <BackgroundImageDialog
        open={isBackgroundDialogOpen}
        onOpenChange={setBackgroundDialogOpen}
      />

      <ClockColorDialog
        open={isClockDialogOpen}
        onOpenChange={setClockDialogOpen}
      />

      <HistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </div>
  );
};

export default SettingsMenu;
