"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  ColorPickerIcon,
  TimeSetting01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTranslation } from "@/constants/languages";
import { useSettingsStore } from "@/store/settingsStore";
import "@/components/Home/ClockZone/Clock.css";

interface ClockColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const predefinedColors = [
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Black", value: "#000000" },
];

export function ClockColorDialog({
  open,
  onOpenChange,
}: ClockColorDialogProps) {
  const {
    language,
    clockColor,
    showClockGlow,
    clockFormat,
    showSeconds,
    setClockColor,
    setShowClockGlow,
    setClockFormat,
    setShowSeconds,
  } = useSettingsStore();

  const t = useMemo(
    () => (key: string) => getTranslation(language, key),
    [language],
  );

  const [tempColor, setTempColor] = useState(clockColor);
  const [tempGlow, setTempGlow] = useState(showClockGlow);
  const [tempFormat, setTempFormat] = useState(clockFormat);
  const [tempSeconds, setTempSeconds] = useState(showSeconds);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    setTempSeconds(showSeconds);
  }, [open, clockColor, showClockGlow, clockFormat, showSeconds]);

  const handleSave = () => {
    setClockColor(tempColor);
    setShowClockGlow(tempGlow);
    setClockFormat(tempFormat);
    setShowSeconds(tempSeconds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    setTempSeconds(showSeconds);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleCancel();
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={TimeSetting01Icon}
              size={20}
              strokeWidth={1.7}
            />
            {t("clockSetting")}
          </DialogTitle>
          <DialogDescription>
            Fine tune color, glow, and format for your digital clock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-light tracking-wide uppercase text-muted-foreground">
              <HugeiconsIcon
                icon={ColorPickerIcon}
                size={16}
                strokeWidth={1.8}
              />
              <span>Clock Tone</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Custom Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="w-12 h-8 rounded border border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground font-mono">
                  {tempColor}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Glow Effect</span>
              <button
                onClick={() => setTempGlow(!tempGlow)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  tempGlow ? "bg-primary" : "bg-muted"
                }`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    tempGlow ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time Format</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setTempFormat("12h")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    tempFormat === "12h"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}>
                  12H
                </button>
                <button
                  onClick={() => setTempFormat("24h")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    tempFormat === "24h"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}>
                  24H
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Seconds</span>
              <button
                onClick={() => setTempSeconds(!tempSeconds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  tempSeconds ? "bg-primary" : "bg-muted"
                }`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    tempSeconds ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium">Predefined Colors</span>
            <div className="grid grid-cols-6 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTempColor(color.value)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    tempColor === color.value
                      ? "border-foreground ring-2 ring-primary"
                      : "border-border hover:border-foreground/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={1.8} />
              Preview
            </div>
            <div
              className="clock-style clock-style--classic text-center text-3xl p-5 rounded-xl"
              style={
                {
                  letterSpacing: "0.08em",
                  color: "var(--clock-color)",
                  textShadow: tempGlow
                    ? "0 0 10px var(--glow-color), 0 0 20px var(--glow-color)"
                    : "none",
                  animation: tempGlow
                    ? "glow 2s ease-in-out infinite alternate"
                    : "none",
                  "--clock-color": tempColor,
                  "--glow-color": tempColor,
                  "--clock-glow-strength": tempGlow ? "1" : "0",
                } as React.CSSProperties
              }>
              {tempFormat === "12h"
                ? tempSeconds
                  ? "12:34:56 PM"
                  : "12:34 PM"
                : tempSeconds
                  ? "12:34:56"
                  : "12:34"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button variant="outline" onClick={handleSave}>
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
