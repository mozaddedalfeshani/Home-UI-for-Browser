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
  ChevronDown,
  ChevronUp,
  Languages,
  Search,
  LayoutTemplate,
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
  const [showMore, setShowMore] = useState(false);

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
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBackgroundDialogOpen(true)}
              className="h-9 w-full justify-start gap-2 px-2 text-[11px] font-medium hover:bg-accent/50">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {t("backgroundImage")}
            </Button>
          </div>
          <DropdownMenuSeparator />

          {/* Theme & Language Row */}
          <div className="grid grid-cols-2 gap-2 p-1">
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("theme")}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-full justify-start gap-2 bg-background/50 hover:bg-accent"
                onClick={() => {
                  const themes: Theme[] = ["system", "light", "dark"];
                  const currentIndex = themes.indexOf(theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  handleThemeChange(themes[nextIndex]);
                }}>
                {theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
                <span className="text-[10px] font-semibold capitalize">
                  {t(theme)}
                </span>
              </Button>
            </div>

            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("language")}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-full justify-start gap-2 bg-background/50 hover:bg-accent"
                onClick={() => handleLanguageChange(language === "en" ? "bn" : "en")}>
                <Languages className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase">
                  {language === "en" ? "EN (English)" : "BN (বাংলা)"}
                </span>
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />
          {/* Search Engine & Shortcut Position Row */}
          <div className="grid grid-cols-2 gap-2 p-1">
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("searchEngine")}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-full justify-start gap-1 bg-background/50 px-1.5 hover:bg-accent"
                onClick={() => {
                  const engines: SearchEngine[] = [
                    "google",
                    "duckduckgo",
                    "bing",
                  ];
                  const currentIndex = engines.indexOf(searchEngine);
                  const nextIndex = (currentIndex + 1) % engines.length;
                  handleSearchEngineChange(engines[nextIndex]);
                }}>
                <Search className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold capitalize">
                  {searchEngine === "duckduckgo" ? "DDG" : searchEngine}
                </span>
              </Button>
            </div>
 
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("shortcutPosition")}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-full justify-start gap-1 bg-background/50 px-1.5 hover:bg-accent"
                onClick={() =>
                  setTabsPosition(tabsPosition === "top" ? "center" : "top")
                }>
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold capitalize">
                  {t(tabsPosition)}
                </span>
              </Button>
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
                id: "autoFocusSearch",
                label: t("autoFocusSearch"),
                checked: autoFocusSearch,
                onCheckedChange: toggleAutoFocusSearch,
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.onCheckedChange}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50 group">
                <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground">
                  {item.label}
                </span>
                <div
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
                </div>
              </button>
            ))}

            {showMore &&
              [
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
                  onCheckedChange: () =>
                    setDynamicWallpaper(!isDynamicWallpaper),
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={item.onCheckedChange}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50 group">
                  <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground">
                    {item.label}
                  </span>
                  <div
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
                  </div>
                </button>
              ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="h-8 w-full justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 hover:bg-accent/40">
              {t("moreSettings")}
              {showMore ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>

          {showMore && (
            <>
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
                  onClick={() => setClockDialogOpen(true)}
                  className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("clockSettings")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileDialogOpen(true)}
                  className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("profileShare")}
                </Button>
              </div>
            </>
          )}
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
