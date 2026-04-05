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
      <DialogContent className="sm:max-w-4xl w-[92vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background/95 backdrop-blur-3xl border-border/40 shadow-stone-900/40">
        <DialogHeader className="px-8 pt-8 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter uppercase italic">
            <HugeiconsIcon icon={TimeSetting01Icon} size={28} strokeWidth={2.5} className="text-primary" />
            {t("clockSetting")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 font-medium ml-10">
            Precision engineering for your dashboard's heartbeat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent">
          {/* Top Controls Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Visibility Card */}
            <div className="bg-muted/10 rounded-3xl border border-border/10 p-5 flex flex-col justify-between transition-all hover:bg-muted/20">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-primary/10 shadow-inner">
                    <HugeiconsIcon icon={ViewIcon} size={22} strokeWidth={2} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Master Control</span>
                    <span className="text-lg font-bold tracking-tight">Visibility</span>
                  </div>
               </div>
               <div className="flex items-center justify-between bg-background/40 rounded-2xl p-3 border border-border/10">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40 ml-2">{tempShow ? 'Active' : 'Offline'}</span>
                  <button
                    onClick={() => setTempShow(!tempShow)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-all duration-500",
                      tempShow ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-muted"
                    )}>
                    <div className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-background shadow-lg transition-all duration-500",
                      tempShow ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
               </div>
            </div>

            {/* Display Placement Card */}
            <div className="lg:col-span-2 bg-muted/10 rounded-3xl border border-border/10 p-5 transition-all hover:bg-muted/20">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <HugeiconsIcon icon={MoveIcon} size={22} strokeWidth={2} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Architecture</span>
                    <span className="text-lg font-bold tracking-tight">Placement</span>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-2 bg-background/30 rounded-2xl p-1.5 border border-border/10">
                  {positionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTempPosition(opt.value)}
                      className={cn(
                        "flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                        tempPosition === opt.value 
                          ? "bg-primary text-primary-foreground shadow-2xl scale-[1.02]" 
                          : "text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground"
                      )}
                    >
                      {opt.label.split(' ')[1] || opt.label}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column: Visual Presets */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <HugeiconsIcon icon={ColorPickerIcon} size={18} strokeWidth={2.5} className="text-primary" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Chromatic Settings</h3>
                </div>
                
                <div className="bg-muted/10 rounded-[2.5rem] border border-border/10 p-8 space-y-8">
                   <div className="flex flex-wrap gap-3">
                     {predefinedColors.map((color) => (
                       <button
                         key={color.value}
                         onClick={() => setTempColor(color.value)}
                         className={cn(
                           "w-9 h-9 rounded-2xl border-4 transition-all duration-500 hover:scale-110 shadow-lg",
                           tempColor === color.value ? "border-primary ring-4 ring-primary/20 scale-110" : "border-background/50 hover:border-white/20"
                         )}
                         style={{ 
                            backgroundColor: color.value, 
                            boxShadow: tempColor === color.value ? `0 0 25px ${color.value}66` : 'none' 
                         }}
                         title={color.name}
                       />
                     ))}
                   </div>

                   <div className="flex items-center justify-between bg-black/20 rounded-3xl p-4 border border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="relative group">
                          <input
                            type="color"
                            value={tempColor}
                            onChange={(e) => setTempColor(e.target.value)}
                            className="w-12 h-12 rounded-2xl border-2 border-white/10 cursor-pointer bg-transparent"
                          />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Hex Code</span>
                           <span className="text-sm font-mono font-bold tracking-tighter">{tempColor.toUpperCase()}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6 pr-2">
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Diffusion</span>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{tempGlow ? 'On' : 'Off'}</span>
                              <button
                                 onClick={() => setTempGlow(!tempGlow)}
                                 className={cn(
                                   "relative h-5 w-10 rounded-full transition-all duration-500",
                                   tempGlow ? "bg-primary" : "bg-muted"
                                 )}>
                                 <div className={cn(
                                   "absolute top-1 h-3 w-3 rounded-full bg-background transition-all duration-500",
                                   tempGlow ? "translate-x-6" : "translate-x-1"
                                 )} />
                               </button>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
            </section>

            {/* Right Column: Behavior & Precision */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                   <HugeiconsIcon icon={TimeSetting01Icon} size={18} strokeWidth={2.5} className="text-primary" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Temporal Logic</h3>
                </div>

                <div className="bg-muted/10 rounded-[2.5rem] border border-border/10 p-8 space-y-6">
                   <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Time Standard</span>
                      <div className="flex bg-black/20 border border-white/5 rounded-2xl p-1.5 gap-1.5">
                        {["12h", "24h"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setTempFormat(f as any)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all duration-500",
                              tempFormat === f ? "bg-primary text-primary-foreground shadow-2xl scale-[1.02]" : "text-muted-foreground/40 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Precision Tracking</span>
                      <button 
                        onClick={() => setTempSeconds(!tempSeconds)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-black/20 border border-white/5 rounded-2xl cursor-pointer hover:bg-black/30 transition-all duration-500"
                      >
                         <div className="flex flex-col items-start">
                            <span className="text-sm font-bold tracking-tight">Sub-Second Detail</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-30 italic">High frequency rendering</span>
                         </div>
                         <div className={cn(
                           "relative h-6 w-11 rounded-full transition-all duration-500",
                           tempSeconds ? "bg-primary" : "bg-muted"
                         )}>
                           <div className={cn(
                             "absolute top-1 h-4 w-4 rounded-full bg-background transition-all duration-500",
                             tempSeconds ? "translate-x-6" : "translate-x-1"
                           )} />
                         </div>
                      </button>
                   </div>
                </div>
            </section>
          </div>

          {/* New Visual Theme Section - Large Cards at Bottom */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
               <HugeiconsIcon icon={Clock01Icon} size={18} strokeWidth={2.5} className="text-primary" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Visual Identity</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {(["classic", "modern"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setTempStyle(theme)}
                  className={cn(
                    "group relative flex flex-col p-8 rounded-[2rem] border-2 transition-all duration-700 text-left overflow-hidden",
                    tempStyle === theme 
                      ? "bg-primary/5 border-primary shadow-[0_20px_50px_rgba(var(--primary),0.15)] ring-4 ring-primary/5 scale-[1.02]" 
                      : "bg-muted/5 border-border/10 hover:border-primary/30 hover:bg-muted/10 grayscale-[0.8] hover:grayscale-0"
                  )}
                >
                  <div className="flex items-center justify-between mb-8 z-10">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-primary/60">{theme === 'classic' ? 'Digital Retro' : 'Modern Pill'}</span>
                      <span className="text-2xl font-black tracking-tighter uppercase italic">{theme === 'classic' ? 'Classic' : 'Modern'}</span>
                    </div>
                    {tempStyle === theme && (
                       <div className="h-4 w-4 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
                    )}
                  </div>

                  <div className="relative flex items-baseline justify-center py-4 z-10">
                    <span 
                       className={cn(
                         "text-5xl font-black transition-all duration-700",
                         theme === 'classic' ? "font-mono opacity-80" : "font-sans tracking-tight"
                       )}
                       style={{ 
                          fontFamily: theme === 'modern' ? 'var(--font-fredoka)' : 'var(--font-share-tech-mono)',
                          color: tempStyle === theme ? tempColor : 'currentColor',
                          textShadow: tempStyle === theme && tempGlow ? `0 0 15px ${tempColor}44` : 'none'
                       }}
                    >
                      12:34
                    </span>
                    <span 
                       className={cn(
                         "ml-2 opacity-30 font-bold",
                         theme === 'modern' ? "text-xl" : "text-sm"
                       )}
                       style={{ 
                          fontFamily: theme === 'modern' ? 'var(--font-fredoka)' : 'inherit',
                       }}
                    >
                      PM
                    </span>
                  </div>

                  {/* Geometric Decoration */}
                  <div className={cn(
                    "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] transition-all duration-1000",
                    tempStyle === theme ? "bg-primary/20 scale-125" : "bg-transparent"
                  )} />
                </button>
              ))}
            </div>
          </section>

          {/* Footer Preview / Summary */}
          <div className="bg-black/40 rounded-[2.5rem] border border-white/5 p-10 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-4 left-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={2.5} />
              Real-time Simulation
            </div>
            
            <div
              className={cn(
                "clock-style transition-all duration-1000 select-none",
                tempStyle === "modern" ? "font-sans italic text-6xl md:text-8xl" : "font-mono text-5xl md:text-7xl",
                tempStyle === "modern" ? "clock-style--modern" : "clock-style--classic"
              )}
              style={{
                fontFamily: tempStyle === "modern" ? "var(--font-fredoka)" : "var(--font-share-tech-mono)",
                color: tempColor,
                letterSpacing: tempStyle === "modern" ? "-0.05em" : "0.02em",
                textShadow: tempGlow
                  ? `0 0 30px ${tempColor}88, 0 0 60px ${tempColor}44`
                  : "none",
                opacity: tempShow ? 1 : 0.2,
                filter: tempShow ? 'none' : 'grayscale(1) brightness(0.5)',
              }}
            >
              {tempFormat === "12h"
                ? tempSeconds
                  ? "00:00:00"
                  : "00:00"
                : tempSeconds
                  ? "00:00:00"
                  : "00:00"}
              <span className={cn(
                "ml-3 opacity-30 font-black italic",
                tempStyle === "modern" ? "text-3xl" : "text-xl"
              )}>
                {tempFormat === "12h" ? "PM" : ""}
              </span>
            </div>

            {!tempShow && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-500">
                 <div className="flex flex-col items-center gap-2">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] px-6 py-2 bg-destructive/20 text-destructive rounded-full border border-destructive/30 shadow-2xl shadow-destructive/20">System Hidden</span>
                 </div>
              </div>
            )}
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-white/5 bg-black/40 flex-shrink-0">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Atomic Reset</span>
              <Button variant="link" className="p-0 h-auto text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">Discard all calibrations</Button>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)} 
                className="rounded-2xl font-black uppercase tracking-widest px-8 py-6 text-[10px] hover:bg-white/5 transition-all"
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleSave} 
                className="rounded-2xl font-black uppercase tracking-widest px-10 py-6 text-[10px] shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
              >
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
