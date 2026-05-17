"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  useSettingsStore,
  DEFAULT_DYNAMIC_WALLPAPERS,
  normalizeDynamicWallpaper,
  type DynamicWallpaperMode,
} from "@/store/settingsStore";
import { cn } from "@/lib/utils";
import { SectionLabel } from "../shared/SectionLabel";
import { ToggleRow } from "../shared/ToggleRow";

const MODES: { value: DynamicWallpaperMode; label: string; desc: string }[] = [
  { value: "auto", label: "Auto", desc: "All images" },
  { value: "theme", label: "Theme", desc: "Light / dark" },
  { value: "time", label: "Time", desc: "Day / night" },
];

function WallpaperPool({
  mode,
  resolvedTheme,
}: {
  mode: DynamicWallpaperMode;
  resolvedTheme: string | undefined;
}) {
  const all = DEFAULT_DYNAMIC_WALLPAPERS.map(normalizeDynamicWallpaper);

  let pool: typeof all;
  let poolLabel: string;

  if (mode === "auto") {
    pool = all;
    poolLabel = `All ${all.length} wallpapers in pool`;
  } else if (mode === "theme") {
    const activeTheme = resolvedTheme === "dark" ? "dark" : "light";
    pool = all.filter((w) => w.mode === "both" || w.mode === activeTheme);
    poolLabel = `${pool.length} wallpapers for ${activeTheme} mode`;
  } else {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    const timeTheme = isDayTime ? "light" : "dark";
    pool = all.filter((w) => w.mode === "both" || w.mode === timeTheme);
    poolLabel = `${pool.length} wallpapers for ${isDayTime ? "day" : "night"} (${hour}:00)`;
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">{poolLabel}</p>
      <div className="flex flex-wrap gap-1.5">
        {pool.map((w, idx) => (
          <div
            key={w.url}
            className="relative h-10 w-14 overflow-hidden rounded-lg border border-border/40"
          >
            <Image
              src={w.url}
              alt={`Pool ${idx}`}
              width={56}
              height={40}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/55 px-0.5 text-[7px] font-semibold uppercase leading-3 text-white">
              {w.mode === "both" ? "all" : w.mode.charAt(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WallpaperSection() {
  const {
    backgroundImage,
    isDynamicWallpaper,
    dynamicWallpaperMode,
    setBackgroundImage,
    setDynamicWallpaper,
    setDynamicWallpaperMode,
  } = useSettingsStore();
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDynamicWallpaper(false);
      setBackgroundImage(file);
    }
  };

  const handleWallpaperClick = async (url: string) => {
    if (backgroundImage === url && !isDynamicWallpaper) {
      setDynamicWallpaper(true);
      await setBackgroundImage(null);
      return;
    }
    setDynamicWallpaper(false);
    await setBackgroundImage(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Dynamic Wallpaper</SectionLabel>
        <ToggleRow
          label="Randomize on every refresh"
          checked={isDynamicWallpaper}
          onChange={() => setDynamicWallpaper(!isDynamicWallpaper)}
        />
      </div>

      {isDynamicWallpaper && (
        <div className="space-y-3">
          <SectionLabel>Wallpaper Mode</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setDynamicWallpaperMode(value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-medium transition-all",
                  dynamicWallpaperMode === value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/40 text-muted-foreground hover:border-border hover:bg-accent/40",
                )}
              >
                <span className="font-semibold">{label}</span>
                <span className="text-[10px] opacity-70">{desc}</span>
              </button>
            ))}
          </div>
          <WallpaperPool
            mode={dynamicWallpaperMode}
            resolvedTheme={resolvedTheme}
          />
        </div>
      )}

      <div>
        <SectionLabel>Gallery</SectionLabel>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-muted/10 hover:border-primary/50 hover:bg-muted/20 transition-all"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </button>
          {DEFAULT_DYNAMIC_WALLPAPERS.map((wallpaper, idx) => {
            const { url, mode } = normalizeDynamicWallpaper(wallpaper);
            return (
              <button
                key={url}
                onClick={() => handleWallpaperClick(url)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  backgroundImage === url && !isDynamicWallpaper
                    ? "border-primary scale-[1.05] shadow-lg"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={url}
                  alt={`Wallpaper ${idx}`}
                  width={80}
                  height={56}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/55 px-1 text-[8px] font-semibold uppercase leading-3 text-white">
                  {mode === "both" ? "all" : mode.charAt(0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
