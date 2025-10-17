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
  const [tempBackgroundImage, setTempBackgroundImage] = useState<string | File | null>(backgroundImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert(`File size too large. Please select a file smaller than 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      // Store the file object directly instead of converting to data URL
      setTempBackgroundImage(file);
    }
  };

  const handleRemoveImage = () => {
    setTempBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    console.log("Saving background image:", tempBackgroundImage);
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

          {tempBackgroundImage && (
            <div className="rounded-lg border overflow-hidden">
              <img
                src={tempBackgroundImage instanceof File ? URL.createObjectURL(tempBackgroundImage) : tempBackgroundImage}
                alt="Background preview"
                className="w-full h-32 object-cover"
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
