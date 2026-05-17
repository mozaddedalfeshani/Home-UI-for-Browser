"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  RotateRight01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
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
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Section components
import { AppearanceSection } from "./sections/AppearanceSection";
import { WallpaperSection } from "./sections/WallpaperSection";
import { LayoutSection } from "./sections/LayoutSection";
import { BehaviorSection } from "./sections/BehaviorSection";
import { ProfileShareSection } from "./sections/ProfileShareSection";
import { PricingSection } from "./sections/PricingSection";
import { AIModelsSection } from "./sections/AIModelsSection";
import { AccountLoginSection } from "./sections/AccountLoginSection";
import { AccountProfileSection } from "./sections/AccountProfileSection";
import { AccountMemorySection } from "./sections/AccountMemorySection";
import { AccountSyncSection } from "./sections/AccountSyncSection";

// Sub-panels (existing, used as direct sections)
import { ClockSettingsPanel } from "./Clock/ClockSettingsPanel";
import { ResizeShortcutsPanel } from "./Shortcuts/ResizeShortcutsPanel";
import { HistoryPanel } from "./History/HistoryPanel";

// Mobile-only section components
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
import { AccountButton } from "../Auth/AccountButton";

// Layout
import { SettingsSidebar } from "./SettingsSidebar";
import type { SettingsSection } from "./types";

const SECTION_TITLES: Record<SettingsSection, string> = {
  appearance: "Appearance",
  wallpaper: "Wallpaper",
  layout: "Layout",
  behavior: "Behavior",
  clock: "Clock",
  shortcuts: "Shortcuts",
  history: "History",
  "profile-share": "Profile Share",
  pricing: "Pricing",
  "ai-models": "AI Models",
  "account-login": "Sign In",
  "account-profile": "My Profile",
  "account-memory": "Memory",
  "account-sync": "Cloud Sync",
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

const SettingsMenu = () => {
  const isDesktop = useIsDesktop();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("appearance");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isMobileProfileDialogOpen, setIsMobileProfileDialogOpen] =
    useState(false);
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

  const { isAuthenticated, user, logout, lastSynced } = useAuthStore();
  const t = useTranslation(language);
  const userRole = user?.role ?? "free";

  const handleSectionChange = (s: SettingsSection) => {
    if (
      !isAuthenticated &&
      (s === "account-profile" ||
        s === "account-memory" ||
        s === "account-sync")
    ) {
      setActiveSection("account-login");
      return;
    }
    setActiveSection(s);
  };

  const handleLogout = async () => {
    setIsSettingsOpen(false);
    await logout();
    toast.success("Logged out");
    setActiveSection("appearance");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSection />;
      case "wallpaper":
        return <WallpaperSection />;
      case "layout":
        return <LayoutSection />;
      case "behavior":
        return <BehaviorSection />;
      case "clock":
        return <ClockSettingsPanel />;
      case "shortcuts":
        return <ResizeShortcutsPanel />;
      case "history":
        return <HistoryPanel />;
      case "profile-share":
        return <ProfileShareSection />;
      case "pricing":
        return <PricingSection userRole={userRole} />;
      case "ai-models":
        return <AIModelsSection userRole={userRole} />;
      case "account-login":
        return (
          <AccountLoginSection
            onLoginComplete={() => setActiveSection("account-profile")}
          />
        );
      case "account-profile":
        return <AccountProfileSection />;
      case "account-memory":
        return <AccountMemorySection />;
      case "account-sync":
        return <AccountSyncSection />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {isDesktop ? (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
            aria-label="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          </Button>

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent
              hideDefaultClose
              className={cn(
                "p-0 overflow-hidden rounded-2xl w-full sm:max-w-3xl sm:h-[520px]",
                user?.role === "plus" && "border-violet-500/60",
                user?.role === "lite" && "border-amber-400/60",
              )}
            >
              <DialogTitle className="sr-only">{t("settings")}</DialogTitle>
              <DialogDescription className="sr-only">
                App settings and account management
              </DialogDescription>

              <div className="flex h-full overflow-hidden">
                <SettingsSidebar
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  onLogout={handleLogout}
                />

                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-border/20 shrink-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      {SECTION_TITLES[activeSection]}
                    </h2>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                    {renderSection()}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-border/60 shadow-lg hover:bg-accent/80 transition-colors"
              aria-label="Settings"
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={16}
                strokeWidth={1.5}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("settings")}
              </span>
              <div className="flex items-center gap-1">
                <AccountButton />
                <ResetDialog>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    aria-label="Reset settings"
                  >
                    <HugeiconsIcon
                      icon={RotateRight01Icon}
                      size={12}
                      strokeWidth={1.5}
                    />
                  </Button>
                </ResetDialog>
              </div>
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
                  onProfileClick={() => setIsMobileProfileDialogOpen(true)}
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
        open={isMobileProfileDialogOpen}
        onOpenChange={setIsMobileProfileDialogOpen}
      />

      {isAuthenticated && lastSynced && (
        <div className="hidden md:flex items-center text-[10px] text-muted-foreground gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
          <HugeiconsIcon
            icon={Tick01Icon}
            size={12}
            className="text-green-500"
          />
          <span>Synced</span>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
