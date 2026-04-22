"use client";

import { Maximize2, History, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

interface ActionGridProps {
  onResizeClick: () => void;
  onHistoryClick: () => void;
  onClockClick: () => void;
  onProfileClick: () => void;
}

export const ActionGrid = ({
  onResizeClick,
  onHistoryClick,
  onClockClick,
  onProfileClick,
}: ActionGridProps) => {
  const { language } = useSettingsStore();
  const t = useTranslation(language);

  return (
    <div className="grid grid-cols-2 gap-1 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onResizeClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
        <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
        {t("resizeShortcuts")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onHistoryClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        {t("history")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClockClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        {t("clockSettings")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onProfileClick}
        className="h-9 justify-start gap-2 px-2 text-[11px] font-normal">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        {t("profileShare")}
      </Button>
    </div>
  );
};
