"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTabsStore, Tab } from "@/store/tabsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";

interface ShortcutDialogProps {
  tab: Tab;
  children: React.ReactNode;
}

export const ShortcutDialog = ({ tab, children }: ShortcutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [shortcut, setShortcut] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [openInNewWindow, setOpenInNewWindow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateTab = useTabsStore((state) => state.updateTab);
  const getTabByShortcut = useTabsStore((state) => state.getTabByShortcut);
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);

  // Initialize form with tab data when dialog opens
  useEffect(() => {
    if (open) {
      setShortcut(tab.shortcut || "");
      setOpenInNewWindow(tab.openInNewWindow || false);
      setError(null);
    }
  }, [open, tab.shortcut, tab.openInNewWindow]);

  const resetForm = () => {
    setShortcut("");
    setOpenInNewWindow(false);
    setIsRecording(false);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  // Keyboard event handler for recording shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isRecording) return;

      event.preventDefault();
      event.stopPropagation();

      const modifiers = [];
      if (event.ctrlKey) modifiers.push("Ctrl");
      if (event.altKey) modifiers.push("Alt");
      if (event.shiftKey) modifiers.push("Shift");
      if (event.metaKey) modifiers.push("Meta");

      // Don't allow shortcuts with only modifiers
      if (event.key === "Control" || event.key === "Alt" || event.key === "Shift" || event.key === "Meta") {
        return;
      }

      const key = event.key === " " ? "Space" : event.key;
      const shortcutString = [...modifiers, key].join("+");

      // Check if shortcut is already in use by another tab
      const existingTab = getTabByShortcut(shortcutString);
      if (existingTab && existingTab.id !== tab.id) {
        setError(t("shortcutInUse"));
        return;
      }

      setShortcut(shortcutString);
      setIsRecording(false);
      setError(null);
    };

    if (isRecording) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isRecording, getTabByShortcut, tab.id, t]);

  const startRecording = () => {
    setIsRecording(true);
    setError(null);
  };

  const clearShortcut = () => {
    setShortcut("");
    setError(null);
  };

  const handleSave = () => {
    // Update the tab with the new shortcut and window preference
    updateTab(tab.id, tab.title, tab.url, shortcut || undefined, openInNewWindow);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("keyboardShortcut")}</DialogTitle>
          <DialogDescription>
            {t("setShortcutDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="shortcut-input">{t("keyboardShortcut")}</Label>
            <div className="flex gap-2">
              <Input
                id="shortcut-input"
                placeholder={isRecording ? t("pressKeys") : "None"}
                value={shortcut}
                readOnly
                className={isRecording ? "ring-2 ring-primary" : ""}
              />
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? () => setIsRecording(false) : startRecording}
                disabled={isRecording}
              >
                {isRecording ? t("cancel") : t("recordShortcut")}
              </Button>
              {shortcut && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearShortcut}
                >
                  {t("clearShortcut")}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open-in-new-window"
              checked={openInNewWindow}
              onCheckedChange={(checked) => setOpenInNewWindow(checked as boolean)}
            />
            <Label htmlFor="open-in-new-window" className="text-sm font-normal">
              {t("openInNewWindow")}
            </Label>
          </div>
          {error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {t("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
