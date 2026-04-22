"use client";

import { useRef } from "react";
import { Image as ImageIcon, Plus } from "lucide-react";
import {
  useSettingsStore,
  DEFAULT_DYNAMIC_WALLPAPERS,
} from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { cn } from "@/lib/utils";

export const BackgroundSection = () => {
  const {
    language,
    backgroundImage,
    isDynamicWallpaper,
    setBackgroundImage,
    setDynamicWallpaper,
  } = useSettingsStore();
  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
    }
  };

  return (
    <div className="space-y-2 p-1">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <button
        onClick={() => setDynamicWallpaper(!isDynamicWallpaper)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-accent/50 group"
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-foreground/90 group-hover:text-foreground">
            {t("backgroundImage")}
          </span>
        </div>
        <div
          className={cn(
            "relative h-4 w-8 rounded-full transition-colors",
            isDynamicWallpaper ? "bg-primary" : "bg-muted",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all",
              isDynamicWallpaper ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </div>
      </button>

      <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide h-14 items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-border/40 bg-muted/10 hover:border-primary/50 hover:bg-muted/20 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {DEFAULT_DYNAMIC_WALLPAPERS.map((url, idx) => (
          <button
            key={url}
            onClick={() => setBackgroundImage(url)}
            className={cn(
              "h-10 w-16 shrink-0 rounded-md border-2 overflow-hidden transition-all",
              backgroundImage === url && !isDynamicWallpaper
                ? "border-primary scale-[1.05] shadow-lg"
                : "border-transparent opacity-60 hover:opacity-100",
            )}
          >
            <img
              src={url}
              alt={`Wallpaper ${idx}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
