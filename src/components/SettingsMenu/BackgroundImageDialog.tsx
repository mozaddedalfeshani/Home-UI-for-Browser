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
                src={tempBackgroundImage}
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
