"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore, type DynamicWallpaperMode } from "@/store/settingsStore";

interface BackgroundImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackgroundImageDialog({
  open,
  onOpenChange,
}: BackgroundImageDialogProps) {
  const {
    backgroundImage,
    setBackgroundImage,
    isDynamicWallpaper,
    setDynamicWallpaper,
    dynamicWallpaperMode,
    setDynamicWallpaperMode,
  } = useSettingsStore();
  const [tempBackgroundImage, setTempBackgroundImage] = useState<
    string | File | null
  >(backgroundImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert(
          `File size too large. Please select a file smaller than 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        );
        return;
      }

      // Store the file object directly instead of converting to data URL
      setTempBackgroundImage(file);
    }
  };

  const handleRemoveImage = () => {
    setTempBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    // console.log("Saving background image:", tempBackgroundImage);
    await setBackgroundImage(tempBackgroundImage);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempBackgroundImage(backgroundImage);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Background Image
          </DialogTitle>
          <DialogDescription>
            Choose a background image for your homepage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12"
            >
              <Upload className="mr-2 h-4 w-4" />
              {tempBackgroundImage ? "Change Image" : "Upload Image"}
            </Button>

            {tempBackgroundImage && (
              <Button
                variant="outline"
                onClick={handleRemoveImage}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Remove Image
              </Button>
            )}
          </div>

          <div className="space-y-3 rounded-lg bg-accent/30 p-4 border border-border/40">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold">Dynamic Wallpaper</span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Randomize background on every refresh from curated list.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDynamicWallpaper(!isDynamicWallpaper)}
                className={`relative h-5 w-10 rounded-full transition-colors ${isDynamicWallpaper ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${isDynamicWallpaper ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            {isDynamicWallpaper && (
              <div className="space-y-1.5 pt-1 border-t border-border/30">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Wallpaper Mode
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      {
                        value: "auto" as DynamicWallpaperMode,
                        label: "Auto",
                        desc: "All images",
                      },
                      {
                        value: "theme" as DynamicWallpaperMode,
                        label: "Theme",
                        desc: "Light / dark",
                      },
                      {
                        value: "time" as DynamicWallpaperMode,
                        label: "Time",
                        desc: "Day / night",
                      },
                    ] as const
                  ).map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDynamicWallpaperMode(value)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-xs transition-colors",
                        dynamicWallpaperMode === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/40 hover:bg-accent",
                      )}
                    >
                      <span className="font-semibold">{label}</span>
                      <span
                        className={cn(
                          "text-[10px]",
                          dynamicWallpaperMode === value
                            ? "opacity-80"
                            : "text-muted-foreground",
                        )}
                      >
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {tempBackgroundImage && !isDynamicWallpaper && (
            <div className="rounded-lg border overflow-hidden shadow-xl ring-1 ring-black/5">
              <Image
                src={
                  tempBackgroundImage instanceof File
                    ? URL.createObjectURL(tempBackgroundImage)
                    : tempBackgroundImage
                }
                alt="Background preview"
                width={400}
                height={160}
                className="w-full h-40 object-cover"
              />
            </div>
          )}
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
