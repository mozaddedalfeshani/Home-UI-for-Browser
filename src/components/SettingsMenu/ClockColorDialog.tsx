"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  ColorPickerIcon,
  TimeSetting01Icon,
  MoveIcon,
  ViewIcon,
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
import { useSettingsStore, ClockPosition } from "@/store/settingsStore";
import "@/components/Home/ClockZone/Clock.css";
import { cn } from "@/lib/utils";

interface ClockColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const predefinedColors = [
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "White", value: "#ffffff" },
  { name: "Orange", value: "#f97316" },
  { name: "Lime", value: "#84cc16" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Teal", value: "#14b8a6" },
];

const positionOptions: { value: ClockPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
];

export function ClockColorDialog({
  open,
  onOpenChange,
}: ClockColorDialogProps) {
  const {
    language,
    showClock,
    clockColor,
    showClockGlow,
    clockFormat,
    showSeconds,
    clockPosition,
    toggleShowClock,
    setClockColor,
    setShowClockGlow,
    setClockFormat,
    setShowSeconds,
    setClockPosition,
  } = useSettingsStore();

  const t = useMemo(
    () => (key: string) => getTranslation(language, key),
    [language],
  );

  const [tempShow, setTempShow] = useState(showClock);
  const [tempColor, setTempColor] = useState(clockColor);
  const [tempGlow, setTempGlow] = useState(showClockGlow);
  const [tempFormat, setTempFormat] = useState(clockFormat);
  const [tempSeconds, setTempSeconds] = useState(showSeconds);
  const [tempPosition, setTempPosition] = useState(clockPosition);

  useEffect(() => {
    if (!open) return;
    setTempShow(showClock);
    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    setTempSeconds(showSeconds);
    setTempPosition(clockPosition);
  }, [open, showClock, clockColor, showClockGlow, clockFormat, showSeconds, clockPosition]);

  const handleSave = () => {
    if (tempShow !== showClock) toggleShowClock();
    setClockColor(tempColor);
    setShowClockGlow(tempGlow);
    setClockFormat(tempFormat);
    setShowSeconds(tempSeconds);
    setClockPosition(tempPosition);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background/95 backdrop-blur-3xl border-border/40 shadow-stone-900/40">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <HugeiconsIcon icon={TimeSetting01Icon} size={22} strokeWidth={2} className="text-primary" />
            {t("clockSetting")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Configure all aspects of your digital clock in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent">
          {/* Main Toggle & Layout Section */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-muted/10 rounded-2xl border border-border/10 p-4 flex items-center justify-between transition-all hover:bg-muted/30">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <HugeiconsIcon icon={ViewIcon} size={18} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">Visibility</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">{tempShow ? 'Show' : 'Hidden'}</span>
                  </div>
               </div>
               <button
                  onClick={() => setTempShow(!tempShow)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    tempShow ? "bg-primary" : "bg-muted"
                  )}>
                  <div className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-md transition-all",
                    tempShow ? "translate-x-5.5" : "translate-x-0.5"
                  )} />
                </button>
            </div>

            <div className="bg-muted/10 rounded-2xl border border-border/10 p-4 transition-all hover:bg-muted/30">
               <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <HugeiconsIcon icon={MoveIcon} size={18} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold tracking-tight">Position</span>
               </div>
               <div className="flex rounded-lg border border-border/30 bg-background/50 p-1 gap-1">
                  {positionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTempPosition(opt.value)}
                      className={cn(
                        "flex-1 flex items-center justify-center py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all",
                        tempPosition === opt.value ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
               </div>
            </div>
          </section>

          {/* Color & Style Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 ml-1">
                <HugeiconsIcon icon={ColorPickerIcon} size={16} strokeWidth={1.8} className="text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("appearance")}</h3>
             </div>
             
             <div className="bg-muted/20 rounded-3xl border border-border/20 p-6 space-y-6">
                {/* Tone Grid - Smaller sizes */}
                <div className="flex flex-wrap gap-2.5">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTempColor(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-xl border-2 transition-all hover:scale-105 shadow-sm",
                        tempColor === color.value ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color.value, boxShadow: tempColor === color.value ? `0 0 10px ${color.value}44` : 'none' }}
                      title={color.name}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono tracking-widest uppercase opacity-40">{tempColor}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold text-muted-foreground">Glow</span>
                       <button
                          onClick={() => setTempGlow(!tempGlow)}
                          className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            tempGlow ? "bg-primary" : "bg-muted"
                          )}>
                          <div className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all",
                            tempGlow ? "translate-x-4.5" : "translate-x-0.5"
                          )} />
                        </button>
                    </div>
                  </div>
                </div>
             </div>
          </section>

          {/* Behavior Section */}
          <section className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                   <HugeiconsIcon icon={Clock01Icon} size={15} strokeWidth={1.8} className="text-muted-foreground" />
                   <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Format</h3>
                </div>
                <div className="flex bg-muted/20 border border-border/10 rounded-2xl p-1 gap-1">
                  {["12h", "24h"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTempFormat(f as any)}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all",
                        tempFormat === f ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                   <HugeiconsIcon icon={TimeSetting01Icon} size={15} strokeWidth={1.8} className="text-muted-foreground" />
                   <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Precision</h3>
                </div>
                <div 
                  onClick={() => setTempSeconds(!tempSeconds)}
                  className="flex items-center justify-between px-4 py-2 bg-muted/20 border border-border/10 rounded-2xl cursor-pointer hover:bg-muted/30 transition-all"
                >
                  <span className="text-xs font-semibold">Show Seconds</span>
                   <button
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        tempSeconds ? "bg-primary" : "bg-muted"
                      )}>
                      <div className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all",
                        tempSeconds ? "translate-x-4.5" : "translate-x-0.5"
                      )} />
                    </button>
                </div>
             </div>
          </section>

          {/* Preview Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/0 rounded-3xl border border-primary/20 p-8 text-center relative overflow-hidden group">
            <div className="absolute top-2 left-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-primary opacity-40">
              <HugeiconsIcon icon={Clock01Icon} size={12} />
              Visual Preview
            </div>
            <div
              className="clock-style clock-style--classic text-5xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 select-none pb-2"
              style={{
                color: tempColor,
                textShadow: tempGlow
                  ? `0 0 20px ${tempColor}66, 0 0 40px ${tempColor}33`
                  : "none",
                opacity: tempShow ? 1 : 0.3,
                filter: tempShow ? 'none' : 'grayscale(1)',
              }}
            >
              {tempFormat === "12h"
                ? tempSeconds
                  ? "12:34:56"
                  : "12:34"
                : tempSeconds
                  ? "12:34:56"
                  : "12:34"}
              <span className="text-lg opacity-40 ml-2 font-medium">
                {tempFormat === "12h" ? "PM" : ""}
              </span>
            </div>
            {!tempShow && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px]">
                 <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-destructive/10 text-destructive rounded-full border border-destructive/20">Hidden</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-border/10 bg-muted/5 flex-shrink-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full font-bold px-6">
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} className="rounded-full font-bold px-8 shadow-xl shadow-primary/20">
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
