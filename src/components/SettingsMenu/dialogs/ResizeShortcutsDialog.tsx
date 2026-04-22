"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/store/settingsStore";

interface ResizeShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResizeShortcutsDialog({ open, onOpenChange }: ResizeShortcutsDialogProps) {
  const { cardSize, cardRadius, setCardSize, setCardRadius } = useSettingsStore();
  const [tempSize, setTempSize] = useState(cardSize);
  const [tempRadius, setTempRadius] = useState(cardRadius);

  const handleSizeChange = (value: number[]) => {
    setTempSize(value[0]);
  };

  const handleRadiusChange = (value: number[]) => {
    setTempRadius(value[0]);
  };

  const handleSave = () => {
    setCardSize(tempSize);
    setCardRadius(tempRadius);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSize(cardSize);
    setTempRadius(cardRadius);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Resize Shortcuts
          </DialogTitle>
          <DialogDescription>
            Adjust the size and border radius of your shortcut cards. Changes will be applied in real-time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Card Size</span>
              <span className="text-sm text-muted-foreground">
                {tempSize.toFixed(1)} rem
              </span>
            </div>
            
            <div className="space-y-2">
              <Slider
                value={[tempSize]}
                onValueChange={handleSizeChange}
                min={5}
                max={10}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small (5rem)</span>
                <span>Large (10rem)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Card Radius</span>
              <span className="text-sm text-muted-foreground">
                {tempRadius.toFixed(1)} rem
              </span>
            </div>
            
            <div className="space-y-2">
              <Slider
                value={[tempRadius]}
                onValueChange={handleRadiusChange}
                min={0.5}
                max={3}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sharp (0.5rem)</span>
                <span>Round (3rem)</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground mb-2">Preview:</div>
            <div className="flex items-center gap-2">
              <div 
                className="border bg-card p-2 flex items-center justify-center"
                style={{ 
                  width: `${tempSize * 0.8}rem`, 
                  height: `${tempSize * 0.6}rem`,
                  fontSize: `${Math.max(0.6, tempSize * 0.08)}rem`,
                  borderRadius: `${tempRadius}rem`
                }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                  A
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {tempSize < 6 ? "Compact" : tempSize < 8 ? "Medium" : "Spacious"} • {tempRadius < 1 ? "Sharp" : tempRadius < 2 ? "Rounded" : "Round"}
              </div>
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
