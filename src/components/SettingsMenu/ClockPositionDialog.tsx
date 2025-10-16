"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore, ClockPosition } from "@/store/settingsStore";
import { Clock, Move } from "lucide-react";

const positionOptions: { value: ClockPosition; label: string; description: string }[] = [
  { value: "top-left", label: "Top Left", description: "Clock appears in the top-left corner" },
  { value: "top-center", label: "Top Center", description: "Clock appears centered at the top" },
  { value: "top-right", label: "Top Right", description: "Clock appears in the top-right corner" },
];

interface ClockPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClockPositionDialog({ open, onOpenChange }: ClockPositionDialogProps) {
  const { clockPosition, setClockPosition } = useSettingsStore();

  const handlePositionChange = (position: ClockPosition) => {
    setClockPosition(position);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Clock Position
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose where you want the clock to appear on your screen.
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            {positionOptions.map((option) => (
              <Button
                key={option.value}
                variant={clockPosition === option.value ? "default" : "outline"}
                className="h-auto p-6 flex flex-col items-center gap-3"
                onClick={() => handlePositionChange(option.value)}
              >
                <Clock className="h-6 w-6" />
                <span className="text-sm font-medium">{option.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Current Position:</p>
            <p className="text-sm text-muted-foreground">
              {positionOptions.find(opt => opt.value === clockPosition)?.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
