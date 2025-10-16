"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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

interface BackgroundImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackgroundImageDialog({ open, onOpenChange }: BackgroundImageDialogProps) {
  const { backgroundImage, setBackgroundImage } = useSettingsStore();
  const [tempBackgroundImage, setTempBackgroundImage] = useState(backgroundImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTempBackgroundImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setTempBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setBackgroundImage(tempBackgroundImage);
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
            Upload a custom background image for your homepage or remove it to use the default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Background Image</span>
              {tempBackgroundImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {tempBackgroundImage ? "Change Image" : "Upload Background"}
              </Button>
              
              {tempBackgroundImage && (
                <div className="relative rounded-lg border bg-muted/50 p-2">
                  <img
                    src={tempBackgroundImage}
                    alt="Background preview"
                    className="h-32 w-full rounded object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-xs text-muted-foreground mb-2">Preview:</div>
            <div 
              className="h-20 w-full rounded border"
              style={{
                backgroundImage: tempBackgroundImage ? `url(${tempBackgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!tempBackgroundImage && (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Default background
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
