"use client";

import { useState } from "react";
import { Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

// Sections
import { ThemeLanguageSection } from "./Theme/ThemeLanguageSection";
import { SearchPositionSection } from "./Search/SearchPositionSection";
import { TogglesSection } from "./Toggles/TogglesSection";
import { BackgroundSection } from "./Background/BackgroundSection";
import { ActionGrid } from "./Shortcuts/ActionGrid";

// Dialogs
import { ResizeShortcutsDialog } from "./Shortcuts/ResizeShortcutsDialog";
import { BackgroundImageDialog } from "./Background/BackgroundImageDialog";
import { ClockColorDialog } from "./Clock/ClockColorDialog";
import { HistoryDialog } from "./History/HistoryDialog";
import { ResetDialog } from "./Reset/ResetDialog";
import { ProfileDialog } from "./Profile/ProfileDialog";

const SettingsMenu = () => {
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const {
    language,
    isClockDialogOpen,
    isBackgroundDialogOpen,
    isResizeDialogOpen,
    setClockDialogOpen,
    setBackgroundDialogOpen,
    setResizeDialogOpen,
  } = useSettingsStore();

  const t = useTranslation(language);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
            aria-label="Settings"
          >
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
                aria-label="Reset settings"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </ResetDialog>
          </div>

          <DropdownMenuSeparator />

          <ThemeLanguageSection />

          <DropdownMenuSeparator />

          <SearchPositionSection />

          <DropdownMenuSeparator />

          <TogglesSection showMore={showMore} setShowMore={setShowMore} />

          <DropdownMenuSeparator />

          <BackgroundSection />

          {showMore && (
            <>
              <DropdownMenuSeparator />
              <ActionGrid
                onResizeClick={() => setResizeDialogOpen(true)}
                onHistoryClick={() => setIsHistoryDialogOpen(true)}
                onClockClick={() => setClockDialogOpen(true)}
                onProfileClick={() => setIsProfileDialogOpen(true)}
              />
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
