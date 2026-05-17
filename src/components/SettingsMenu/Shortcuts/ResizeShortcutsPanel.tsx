"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/store/settingsStore";

interface ResizeShortcutsPanelProps {
  onBack?: () => void;
}

export function ResizeShortcutsPanel({ onBack }: ResizeShortcutsPanelProps) {
  const { cardSize, cardRadius, setCardSize, setCardRadius } =
    useSettingsStore();
  const [tempSize, setTempSize] = useState(cardSize);
  const [tempRadius, setTempRadius] = useState(cardRadius);

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} strokeWidth={2} />
          Back
        </button>
      )}

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Card Size</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {tempSize.toFixed(1)} rem
            </span>
          </div>
          <Slider
            value={[tempSize]}
            onValueChange={(v) => setTempSize(v[0])}
            min={3}
            max={10}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>Small (3rem)</span>
            <span>Large (10rem)</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Card Radius</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {tempRadius.toFixed(1)} rem
            </span>
          </div>
          <Slider
            value={[tempRadius]}
            onValueChange={(v) => setTempRadius(v[0])}
            min={0.5}
            max={3}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>Sharp (0.5rem)</span>
            <span>Round (3rem)</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/30 bg-muted/20 p-3">
          <p className="text-[10px] text-muted-foreground mb-2">Preview</p>
          <div className="flex items-center gap-2">
            <div
              className="border bg-card flex items-center justify-center"
              style={{
                width: `${tempSize * 0.8}rem`,
                height: `${tempSize * 0.6}rem`,
                borderRadius: `${tempRadius}rem`,
              }}
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                A
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {tempSize < 6 ? "Compact" : tempSize < 8 ? "Medium" : "Spacious"}{" "}
              ·{" "}
              {tempRadius < 1 ? "Sharp" : tempRadius < 2 ? "Rounded" : "Round"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            setTempSize(cardSize);
            setTempRadius(cardRadius);
            onBack?.();
          }}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            setCardSize(tempSize);
            setCardRadius(tempRadius);
            onBack?.();
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
