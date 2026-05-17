"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import {
  exportShareProfile,
  importShareProfile,
} from "@/lib/shareProfileStore";
import { parseShareProfile, type ShareProfileV1 } from "@/lib/shareProfile";

export function ProfileShareSection() {
  const { language } = useSettingsStore();
  const { setTheme } = useTheme();
  const t = useTranslation(language);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingProfile, setPendingProfile] = useState<ShareProfileV1 | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      const profile = exportShareProfile();
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `launchtab-profile-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert(t("profileExportFailed"));
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    try {
      const { data, error } = parseShareProfile(
        JSON.parse(await file.text()) as unknown,
      );
      if (!data) {
        alert(error ?? t("profileImportInvalid"));
        return;
      }
      setPendingProfile(data);
      setIsConfirmOpen(true);
    } catch {
      alert(t("profileImportInvalid"));
    }
  };

  const applyImport = () => {
    if (!pendingProfile) return;
    setIsImporting(true);
    try {
      const result = importShareProfile(pendingProfile);
      if (!result.applied) {
        alert(result.error ?? t("profileImportFailed"));
        return;
      }
      if (result.theme) setTheme(result.theme);
      setIsConfirmOpen(false);
      setPendingProfile(null);
      alert(t("profileImportSuccess"));
    } catch {
      alert(t("profileImportFailed"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("profileShareDescription")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={24}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            {t("exportProfile")}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <HugeiconsIcon
              icon={Upload01Icon}
              size={24}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            {t("importProfile")}
          </button>
        </div>
      </div>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setPendingProfile(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t("importProfileConfirmTitle")}</DialogTitle>
          <DialogDescription>
            {t("importProfileConfirmDescription")}
          </DialogDescription>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmOpen(false);
                setPendingProfile(null);
              }}
              disabled={isImporting}
            >
              {t("cancel")}
            </Button>
            <Button onClick={applyImport} disabled={isImporting}>
              {isImporting ? t("loading") : t("importProfile")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
