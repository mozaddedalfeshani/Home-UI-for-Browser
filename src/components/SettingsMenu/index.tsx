"use client";

import { useRef, useState } from "react";
import {
  Settings,
  Monitor,
  Sun,
  Moon,
  Maximize2,
  Download,
  Upload,
  Image as ImageIcon,
  Clock,
  RotateCcw,
  History,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutPreset,
  SearchEngine,
  TabsPosition,
  useSettingsStore,
  Theme,
} from "@/store/settingsStore";
import { Language, useTranslation } from "@/constants/languages";
import {
  importShareProfile,
  exportShareProfile,
} from "@/lib/shareProfileStore";
import { parseShareProfile, type ShareProfileV1 } from "@/lib/shareProfile";
import { ResizeShortcutsDialog } from "./ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./BackgroundImageDialog";
import { ClockColorDialog } from "./ClockColorDialog";
import { HistoryDialog } from "./HistoryDialog";
import { ResetDialog } from "./ResetDialog";

const SettingsMenu = () => {
  const { setTheme } = useTheme();
  const [pendingImportProfile, setPendingImportProfile] =
    useState<ShareProfileV1 | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    theme,
    language,
    autoOrderTabs,
    showRightSidebar,
    enableLeftSidebarHover,
    searchEngine,
    layoutPreset,
    tabsPosition,
    isClockDialogOpen,
    isBackgroundDialogOpen,
    isResizeDialogOpen,
    isDynamicWallpaper,
    setTheme: setSettingsTheme,
    setLanguage,
    setSearchEngine,
    setLayoutPreset,
    setTabsPosition,
    setDynamicWallpaper,
    toggleAutoOrderTabs,
    toggleShowRightSidebar,
    toggleLeftSidebarHover,
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

  const handleLayoutPresetChange = (nextPreset: string) => {
    setLayoutPreset(nextPreset as LayoutPreset);
  };

  // Translation function
  const t = useTranslation(language);

  const handleExportProfile = () => {
    try {
      const profile = exportShareProfile();
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const datePart = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `mclx-home-profile-${datePart}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      // console.error("Failed to export profile:", error);
      alert(t("profileExportFailed"));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsedJson = JSON.parse(raw) as unknown;
      const { data, error } = parseShareProfile(parsedJson);

      if (!data) {
        alert(error ?? t("profileImportInvalid"));
        return;
      }

      setPendingImportProfile(data);
      setIsImportConfirmOpen(true);
    } catch {
      // console.error("Failed to import profile file:", error);
      alert(t("profileImportInvalid"));
    }
  };

  const applyImportedProfile = () => {
    if (!pendingImportProfile) {
      return;
    }

    setIsImporting(true);

    try {
      const result = importShareProfile(pendingImportProfile);
      if (!result.applied) {
        alert(result.error ?? t("profileImportFailed"));
        return;
      }
      if (result.theme) {
        setTheme(result.theme);
      }
      setIsImportConfirmOpen(false);
      setPendingImportProfile(null);
      alert(t("profileImportSuccess"));
    } catch {
      // console.error("Failed to apply imported profile:", error);
      alert(t("profileImportFailed"));
    } finally {
      setIsImporting(false);
    }
  };

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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("settings")}</span>
            <ResetDialog>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                aria-label="Reset settings"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </ResetDialog>
          </div>
          <DropdownMenuSeparator />

          {/* Theme & Language Row */}
          <div className="grid grid-cols-2 gap-2 p-1">
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">{t("theme")}</span>
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
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">{t("language")}</span>
              <div className="flex h-8 items-center rounded-md border border-border/50 bg-background/50 p-0.5">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold transition-all",
                    language === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
                  )}>
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange("bn")}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold transition-all",
                    language === "bn" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
                  )}>
                  BN
                </button>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Search Engine Selection */}
          <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">{t("searchEngine")}</span>
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
          <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">{t("layoutMode")}</span>
            <div className="flex rounded-md border border-border/50 bg-background/50 p-0.5">
              {["default", "compact", "focus"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleLayoutPresetChange(preset)}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold capitalize transition-all",
                    layoutPreset === preset ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
                  )}>
                  {t(`layout${preset.charAt(0).toUpperCase() + preset.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcut Position Selection */}
          <div className="px-2 py-2">
            <span className="mb-2 block text-[10px] font-medium uppercase text-muted-foreground/70">{t("shortcutPosition")}</span>
            <div className="flex rounded-md border border-border/50 bg-background/50 p-0.5">
              {["top", "center"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setTabsPosition(pos as TabsPosition)}
                  className={cn(
                    "flex-1 rounded-sm py-1 text-[10px] font-semibold capitalize transition-all",
                    tabsPosition === pos ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
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
              { id: "autoOrderTabs", label: t("autoOrderTabs"), checked: autoOrderTabs, onCheckedChange: toggleAutoOrderTabs },
              { id: "showRightSidebar", label: t("showRightSidebar"), checked: showRightSidebar, onCheckedChange: toggleShowRightSidebar },
              { id: "enableLeftSidebarHover", label: t("enableLeftSidebarHover"), checked: enableLeftSidebarHover, onCheckedChange: toggleLeftSidebarHover },
              { id: "dynamicWallpaper", label: t("dynamicWallpaper"), checked: isDynamicWallpaper, onCheckedChange: () => setDynamicWallpaper(!isDynamicWallpaper) },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent/50">
                <span className="text-[11px] font-medium">{item.label}</span>
                <button
                  onClick={item.onCheckedChange}
                  className={cn(
                    "relative h-4 w-8 rounded-full transition-colors",
                    item.checked ? "bg-primary" : "bg-muted"
                  )}>
                  <div className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all",
                    item.checked ? "translate-x-4" : "translate-x-0.5"
                  )} />
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
              onClick={() => setIsHistoryDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              {t("history")}
            </Button>
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
              onClick={() => setBackgroundDialogOpen(true)}
              className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {t("backgroundImage")}
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

          <DropdownMenuSeparator />

          {/* Profile Share */}
          <div className="space-y-2 p-1">
            <div className="px-2">
              <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                {t("profileShare")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportProfile}
                className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
                {t("exportProfile")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportClick}
                className="h-9 justify-start gap-2 px-2 text-[11px] font-normal"
              >
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                {t("importProfile")}
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

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

      <Dialog
        open={isImportConfirmOpen}
        onOpenChange={(open) => {
          setIsImportConfirmOpen(open);
          if (!open) {
            setPendingImportProfile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importProfileConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("importProfileConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportConfirmOpen(false);
                setPendingImportProfile(null);
              }}
              disabled={isImporting}
            >
              {t("cancel")}
            </Button>
            <Button onClick={applyImportedProfile} disabled={isImporting}>
              {isImporting ? t("loading") : t("importProfile")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsMenu;
