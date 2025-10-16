"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settingsStore";

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
];

export function ClockColorDialog({ open, onOpenChange }: ClockColorDialogProps) {
  const { clockColor, showClockGlow, clockFormat, setClockColor, setShowClockGlow, setClockFormat } = useSettingsStore();
  const [tempColor, setTempColor] = useState(clockColor);
  const [tempGlow, setTempGlow] = useState(showClockGlow);
  const [tempFormat, setTempFormat] = useState(clockFormat);

  const handleSave = () => {
    setClockColor(tempColor);
    setShowClockGlow(tempGlow);
    setClockFormat(tempFormat);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempColor(clockColor);
    setTempGlow(showClockGlow);
    setTempFormat(clockFormat);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Clock Color
          </DialogTitle>
          <DialogDescription>
            Choose a color for your digital clock display.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
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
                  tempGlow ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    tempGlow ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time Format</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setTempFormat('12h')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    tempFormat === '12h' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  12H
                </button>
                <button
                  onClick={() => setTempFormat('24h')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    tempFormat === '24h' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  24H
                </button>
              </div>
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
                      ? 'border-foreground ring-2 ring-primary' 
                      : 'border-border hover:border-foreground/50'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground mb-2">Preview:</div>
            <div 
              className={`text-2xl font-mono font-bold text-center p-2 rounded ${
                tempGlow ? 'glow' : ''
              }`}
              style={{
                color: tempColor,
                textShadow: tempGlow ? `0 0 10px ${tempColor}, 0 0 20px ${tempColor}` : 'none',
                animation: tempGlow ? `glow 2s ease-in-out infinite alternate` : 'none',
                '--glow-color': tempColor,
              } as React.CSSProperties}
            >
              {tempFormat === '12h' ? '12:34:56 PM' : '12:34:56'}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
