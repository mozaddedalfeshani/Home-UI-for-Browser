"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

interface TogglesSectionProps {
  showMore: boolean;
  setShowMore: (show: boolean) => void;
}

export const TogglesSection = ({ showMore, setShowMore }: TogglesSectionProps) => {
  const {
    language,
    autoOrderTabs,
    showRightSidebar,
    autoFocusSearch,
    enableLeftSidebarHover,
    enableSearchHoverZone,
    isDynamicWallpaper,
    toggleAutoOrderTabs,
    toggleShowRightSidebar,
    toggleAutoFocusSearch,
    toggleLeftSidebarHover,
    toggleSearchHoverZone,
    setDynamicWallpaper,
  } = useSettingsStore();
  
  const t = useTranslation(language);

  const mainToggles = [
    { id: "autoOrderTabs", label: t("autoOrderTabs"), checked: autoOrderTabs, onChange: toggleAutoOrderTabs },
    { id: "showRightSidebar", label: t("showRightSidebar"), checked: showRightSidebar, onChange: toggleShowRightSidebar },
    { id: "autoFocusSearch", label: t("autoFocusSearch"), checked: autoFocusSearch, onChange: toggleAutoFocusSearch },
  ];

  const extraToggles = [
    { id: "enableLeftSidebarHover", label: t("enableLeftSidebarHover"), checked: enableLeftSidebarHover, onChange: toggleLeftSidebarHover },
    { id: "enableSearchHoverZone", label: t("enableSearchHoverZone"), checked: enableSearchHoverZone, onChange: toggleSearchHoverZone },
    { id: "dynamicWallpaper", label: t("dynamicWallpaper"), checked: isDynamicWallpaper, onChange: () => setDynamicWallpaper(!isDynamicWallpaper) },
  ];

  return (
    <div className="space-y-1 p-1">
      {mainToggles.map((item) => (
        <button
          key={item.id}
          onClick={item.onChange}
          className="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50 group">
          <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground">
            {item.label}
          </span>
          <div className={cn("relative h-4 w-8 rounded-full transition-colors", item.checked ? "bg-primary" : "bg-muted")}>
            <div className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all", item.checked ? "translate-x-4" : "translate-x-0.5")} />
          </div>
        </button>
      ))}

      {showMore && extraToggles.map((item) => (
        <button
          key={item.id}
          onClick={item.onChange}
          className="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50 group">
          <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground">
            {item.label}
          </span>
          <div className={cn("relative h-4 w-8 rounded-full transition-colors", item.checked ? "bg-primary" : "bg-muted")}>
            <div className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all", item.checked ? "translate-x-4" : "translate-x-0.5")} />
          </div>
        </button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMore(!showMore)}
        className="h-8 w-full justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 hover:bg-accent/40">
        {t("moreSettings")}
        {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>
    </div>
  );
};
