"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  ColorPickerIcon,
  TimeSetting01Icon,
  MoveIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore, ClockPosition } from "@/store/settingsStore";
import { getTranslation } from "@/constants/languages";

const CLOCK_COLORS = [
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ffffff",
  "#f97316",
];

const CLOCK_POSITIONS: { value: ClockPosition; label: string }[] = [
  { value: "top-left", label: "Left" },
  { value: "top-center", label: "Center" },
  { value: "top-right", label: "Right" },
];

interface ClockSettingsPanelProps {
  onBack: () => void;
}

export function ClockSettingsPanel({ onBack }: ClockSettingsPanelProps) {
  const {
    language,
    showClock,
    clockColor,
    showClockGlow,
    clockFormat,
    showSeconds,
    clockPosition,
    clockStyle,
    toggleShowClock,
    setClockColor,
    setShowClockGlow,
    setClockFormat,
    setShowSeconds,
    setClockPosition,
    setClockStyle,
  } = useSettingsStore();

  const t = (key: string) => getTranslation(language, key);

  const [tempShow, setTempShow] = useState(showClock);
  const [tempColor, setTempColor] = useState(clockColor);
  const [tempGlow, setTempGlow] = useState(showClockGlow);
  const [tempFormat, setTempFormat] = useState(clockFormat);
  const [tempSeconds, setTempSeconds] = useState(showSeconds);
  const [tempPosition, setTempPosition] =
    useState<ClockPosition>(clockPosition);
  const [tempStyle, setTempStyle] = useState(clockStyle);

  // Re-sync when store changes externally
  useEffect(() => {
    setTempShow(showClock);
    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    setTempSeconds(showSeconds);
    setTempPosition(clockPosition);
    setTempStyle(clockStyle);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (tempShow !== showClock) toggleShowClock();
    setClockColor(tempColor);
    setShowClockGlow(tempGlow);
    setClockFormat(tempFormat);
    setShowSeconds(tempSeconds);
    setClockPosition(tempPosition);
    setClockStyle(tempStyle);
    onBack();
  };

  return (
    <div className="space-y-4 overflow-y-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
        Back
      </button>

      {/* Visibility */}
      <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 p-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ViewIcon}
            size={15}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-sm font-medium">Visibility</span>
        </div>
        <button
          onClick={() => setTempShow(!tempShow)}
          className={cn(
            "relative h-5 w-10 rounded-full transition-all duration-300",
            tempShow ? "bg-primary" : "bg-muted",
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all duration-300",
              tempShow ? "translate-x-5.5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {/* Position */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={MoveIcon}
            size={15}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-sm font-medium">Position</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CLOCK_POSITIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTempPosition(opt.value)}
              className={cn(
                "py-1.5 rounded-lg text-xs font-medium transition-all",
                tempPosition === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={TimeSetting01Icon}
            size={15}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-sm font-medium">Format</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(["12h", "24h"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTempFormat(f)}
              className={cn(
                "py-1.5 rounded-lg text-xs font-medium transition-all",
                tempFormat === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80",
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Show seconds</span>
          <button
            onClick={() => setTempSeconds(!tempSeconds)}
            className={cn(
              "relative h-5 w-10 rounded-full transition-all duration-300",
              tempSeconds ? "bg-primary" : "bg-muted",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all duration-300",
                tempSeconds ? "translate-x-5.5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </div>

      {/* Color */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ColorPickerIcon}
            size={15}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-sm font-medium">Color</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CLOCK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setTempColor(c)}
              className={cn(
                "w-6 h-6 rounded-lg border-2 transition-all hover:scale-110",
                tempColor === c
                  ? "border-primary ring-2 ring-primary/20 scale-110"
                  : "border-background/50",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={tempColor}
            onChange={(e) => setTempColor(e.target.value)}
            className="w-6 h-6 rounded-lg border-0 cursor-pointer bg-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Glow effect</span>
          <button
            onClick={() => setTempGlow(!tempGlow)}
            className={cn(
              "relative h-5 w-10 rounded-full transition-all duration-300",
              tempGlow ? "bg-primary" : "bg-muted",
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all duration-300",
                tempGlow ? "translate-x-5.5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </div>

      {/* Style */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Clock01Icon}
            size={15}
            strokeWidth={2}
            className="text-primary"
          />
          <span className="text-sm font-medium">Style</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["classic", "modern"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTempStyle(s)}
              className={cn(
                "flex flex-col items-center py-3 rounded-xl border-2 transition-all",
                tempStyle === s
                  ? "border-primary bg-primary/5"
                  : "border-border/30 bg-muted/5 hover:border-primary/30",
              )}
            >
              <span
                className="text-sm font-bold"
                style={{
                  color: tempStyle === s ? tempColor : "currentColor",
                  fontFamily:
                    s === "modern"
                      ? "var(--font-fredoka)"
                      : "var(--font-share-tech-mono)",
                }}
              >
                12:34
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 capitalize">
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onBack}>
          {t("cancel")}
        </Button>
        <Button size="sm" className="flex-1" onClick={handleSave}>
          {t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
