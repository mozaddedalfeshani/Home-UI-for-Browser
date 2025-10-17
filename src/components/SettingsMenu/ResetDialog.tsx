"use client";

import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTabsStore } from "@/store/tabsStore";
import { useProjectStore } from "@/store/projectStore";
import { useNotepadStore } from "@/store/notepadStore";
import { useTranslation } from "@/constants/languages";
import { AlertTriangle } from "lucide-react";

interface ResetDialogProps {
  children: React.ReactNode;
}

export const ResetDialog = ({ children }: ResetDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);
  
  // Get store actions
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const resetTabs = useTabsStore((state) => state.resetTabs);
  const resetProjects = useProjectStore((state) => state.resetProjects);
  const resetNotepad = useNotepadStore((state) => state.resetNotepad);

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      // Reset all stores
      resetSettings();
      resetTabs();
      resetProjects();
      resetNotepad();
      
      // Close dialog
      setOpen(false);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("resetEverything")}
          </DialogTitle>
          <DialogDescription>
            {t("resetWarning")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="font-medium text-destructive mb-2">
              {t("confirmReset")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("resetEverythingDescription")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isResetting}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? t("loading") : t("resetEverything")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
