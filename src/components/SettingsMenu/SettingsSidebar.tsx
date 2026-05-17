"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  PaintBrush01Icon,
  Image01Icon,
  Search01Icon,
  AccountSetting01Icon,
  Clock01Icon,
  Maximize01Icon,
  TimeScheduleIcon,
  Share01Icon,
  Crown02Icon,
  AiNetworkIcon,
  UserIcon,
  AiBrain01Icon,
  CloudUploadIcon,
  Logout01Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { ResetDialog } from "./Reset/ResetDialog";
import type { SettingsSection } from "./types";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onLogout: () => void;
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SettingsSidebarProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { language } = useSettingsStore();
  const t = useTranslation(language);
  const userRole = user?.role ?? "free";

  const APP_NAV: {
    id: SettingsSection;
    label: string;
    icon: IconSvgElement;
  }[] = [
    { id: "appearance", label: "Appearance", icon: PaintBrush01Icon },
    { id: "wallpaper", label: "Wallpaper", icon: Image01Icon },
    { id: "layout", label: "Layout", icon: Search01Icon },
    { id: "behavior", label: "Behavior", icon: AccountSetting01Icon },
    { id: "clock", label: "Clock", icon: Clock01Icon },
    { id: "shortcuts", label: "Shortcuts", icon: Maximize01Icon },
    { id: "history", label: t("history"), icon: TimeScheduleIcon },
    { id: "profile-share", label: t("profileShare"), icon: Share01Icon },
    { id: "pricing", label: "Pricing", icon: Crown02Icon },
    ...(userRole === "lite" || userRole === "plus"
      ? [
          {
            id: "ai-models" as SettingsSection,
            label: "AI Models",
            icon: AiNetworkIcon,
          },
        ]
      : []),
  ];

  const ACCOUNT_ITEMS: {
    id: SettingsSection;
    label: string;
    icon: IconSvgElement;
  }[] = [
    { id: "account-profile", label: "My Profile", icon: UserIcon },
    { id: "account-memory", label: "Memory", icon: AiBrain01Icon },
    { id: "account-sync", label: "Cloud Sync", icon: CloudUploadIcon },
  ];

  const navItemClass = (id: SettingsSection) =>
    cn(
      "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
      activeSection === id
        ? "bg-accent text-foreground font-medium"
        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
    );

  return (
    <div className="flex flex-col w-52 shrink-0 border-r border-border/20 bg-muted/20">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/20">
        <span className="text-sm font-semibold text-foreground">
          {t("settings")}
        </span>
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

      <nav className="flex-1 overflow-y-auto py-2">
        {APP_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={navItemClass(item.id)}
          >
            <HugeiconsIcon
              icon={item.icon}
              size={15}
              strokeWidth={1.5}
              className="shrink-0 opacity-80"
            />
            {item.label}
          </button>
        ))}

        <div className="mx-4 my-2 border-t border-border/20" />
        <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
          Account
        </p>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => onSectionChange("account-login")}
            className={navItemClass("account-login")}
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={15}
              strokeWidth={1.5}
              className="shrink-0 opacity-80"
            />
            Sign in
          </button>
        )}

        {ACCOUNT_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={cn(
              navItemClass(item.id),
              !isAuthenticated && "opacity-40 cursor-not-allowed",
            )}
          >
            <HugeiconsIcon
              icon={item.icon}
              size={15}
              strokeWidth={1.5}
              className="shrink-0 opacity-80"
            />
            {item.label}
          </button>
        ))}

        {isAuthenticated && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-accent/60 transition-colors"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              size={15}
              strokeWidth={1.5}
              className="shrink-0"
            />
            Log out
          </button>
        )}
      </nav>

      {isAuthenticated && (
        <div className="border-t border-border/20 px-4 py-3">
          <p className="text-xs font-medium text-foreground truncate">
            {user?.name || "Account"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
      )}
    </div>
  );
}
