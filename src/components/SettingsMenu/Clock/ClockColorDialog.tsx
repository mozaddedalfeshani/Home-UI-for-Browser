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
    clockStyle,
    toggleShowClock,
    setClockColor,
    setShowClockGlow,
    setClockFormat,
    setShowSeconds,
    setClockPosition,
    setClockStyle,
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
  const [tempStyle, setTempStyle] = useState(clockStyle);

  useEffect(() => {
    if (!open) return;
    setTempShow(showClock);
    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    setTempSeconds(showSeconds);
    setTempPosition(clockPosition);
    setTempStyle(clockStyle);
  }, [open, showClock, clockColor, showClockGlow, clockFormat, showSeconds, clockPosition, clockStyle]);

  const handleSave = () => {
    if (tempShow !== showClock) toggleShowClock();
    setClockColor(tempColor);
    setShowClockGlow(tempGlow);
    setClockFormat(tempFormat);
    setShowSeconds(tempSeconds);
    setClockPosition(tempPosition);
    setClockStyle(tempStyle);
    onOpenChange(false);
  };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[92vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background/95 backdrop-blur-3xl border-border/40 shadow-stone-900/40">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-black tracking-tighter uppercase italic">
            <HugeiconsIcon icon={TimeSetting01Icon} size={24} strokeWidth={2.5} className="text-primary" />
            {t("clockSetting")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 font-medium ml-8 text-xs">
            Precision engineering for your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent text-foreground">
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-muted/10 rounded-2xl border border-border/10 p-4 flex items-center justify-between transition-all hover:bg-muted/20">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 shadow-inner">
                    <HugeiconsIcon icon={ViewIcon} size={18} strokeWidth={2} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Master Control</span>
                    <span className="text-sm font-bold tracking-tight">Visibility</span>
                  </div>
               </div>
               <button
                  onClick={() => setTempShow(!tempShow)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-all duration-500",
                    tempShow ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-muted"
                  )}>
                  <div className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-lg transition-all duration-500",
                    tempShow ? "translate-x-5.5" : "translate-x-0.5"
                  )} />
                </button>
            </div>

            <div className="bg-muted/10 rounded-2xl border border-border/10 p-4 transition-all hover:bg-muted/20">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <HugeiconsIcon icon={MoveIcon} size={18} strokeWidth={2} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Architecture</span>
                    <span className="text-sm font-bold tracking-tight">Placement</span>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-2 bg-background/30 rounded-xl p-1 border border-border/10">
                  {positionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTempPosition(opt.value)}
                      className={cn(
                        "flex items-center justify-center py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                        tempPosition === opt.value 
                          ? "bg-primary text-primary-foreground shadow-xl scale-[1.02]" 
                          : "text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground"
                      )}
                    >
                      {opt.label.split(' ')[1] || opt.label}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Color & Format Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
             <section className="bg-muted/10 rounded-2xl border border-border/10 p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <HugeiconsIcon icon={ColorPickerIcon} size={14} strokeWidth={2.5} className="text-primary" />
                   <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Chromatic</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.slice(0, 8).map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTempColor(color.value)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 transition-all duration-500 hover:scale-110",
                        tempColor === color.value ? "border-primary ring-2 ring-primary/20 scale-110" : "border-background/50"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between bg-black/20 rounded-xl p-2.5 border border-white/5">
                   <input
                     type="color"
                     value={tempColor}
                     onChange={(e) => setTempColor(e.target.value)}
                     className="w-6 h-6 rounded-md border-0 cursor-pointer bg-transparent"
                   />
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold uppercase opacity-30 tracking-widest">{tempGlow ? 'Glow On' : 'Glow Off'}</span>
                      <button
                         onClick={() => setTempGlow(!tempGlow)}
                         className={cn(
                           "relative h-4 w-8 rounded-full transition-all duration-500",
                           tempGlow ? "bg-primary" : "bg-muted"
                         )}>
                         <div className={cn(
                           "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all duration-500",
                           tempGlow ? "translate-x-4.5" : "translate-x-0.5"
                         )} />
                       </button>
                   </div>
                </div>
             </section>

             <section className="bg-muted/10 rounded-2xl border border-border/10 p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <HugeiconsIcon icon={TimeSetting01Icon} size={14} strokeWidth={2.5} className="text-primary" />
                   <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Format</h3>
                </div>
                <div className="flex bg-black/20 border border-white/5 rounded-xl p-1 gap-1">
                  {["12h", "24h"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTempFormat(f as "12h" | "24h")}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition-all",
                        tempFormat === f ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground/40 hover:text-white"
                      )}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setTempSeconds(!tempSeconds)}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:bg-black/30 transition-all font-sans"
                >
                   <span className="text-[10px] font-bold tracking-tight">Seconds</span>
                   <div className={cn(
                     "relative h-4 w-8 rounded-full transition-all duration-500",
                     tempSeconds ? "bg-primary" : "bg-muted"
                   )}>
                     <div className={cn(
                       "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all duration-500",
                       tempSeconds ? "translate-x-4.5" : "translate-x-0.5"
                     )} />
                   </div>
                </button>
             </section>
          </div>

          {/* Theme Section - Compact Cards */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-1">
               <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={2.5} className="text-primary" />
               <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Visual Theme</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {(["classic", "modern"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setTempStyle(theme)}
                  className={cn(
                    "group relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden",
                    tempStyle === theme 
                      ? "bg-primary/5 border-primary shadow-lg ring-2 ring-primary/5 scale-[1.02]" 
                      : "bg-muted/5 border-border/10 hover:border-primary/30 hover:bg-muted/10 grayscale-[0.8] hover:grayscale-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-4 z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{theme}</span>
                    {tempStyle === theme && (
                       <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>

                  <div className="relative flex items-baseline justify-center py-2 z-10 text-foreground">
                    <span 
                       className={cn(
                         "text-3xl font-bold transition-all duration-500",
                         theme === 'classic' ? "font-mono opacity-80 uppercase" : "font-sans"
                       )}
                       style={{ 
                          fontFamily: theme === 'modern' ? 'var(--font-fredoka)' : 'var(--font-share-tech-mono)',
                          color: tempStyle === theme ? tempColor : 'currentColor',
                          letterSpacing: theme === 'modern' ? '-0.02em' : '0.02em',
                       }}
                    >
                      12:34
                    </span>
                    <span className="ml-1 text-[10px] opacity-30 font-bold">PM</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <DialogFooter className="p-6 border-t border-white/5 bg-black/40 flex-shrink-0">
          <div className="flex w-full items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} className="h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
              {t("saveChanges")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
