"use client";

import { useRef, useState } from "react";
import { Download, Upload, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import { useTheme } from "next-themes";
import {
  importShareProfile,
  exportShareProfile,
} from "@/lib/shareProfileStore";
import { parseShareProfile, type ShareProfileV1 } from "@/lib/shareProfile";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const { setTheme } = useTheme();
  const [pendingImportProfile, setPendingImportProfile] =
    useState<ShareProfileV1 | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);

  const handleExportProfile = () => {
    try {
      const profile = exportShareProfile();
      const blob = new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const datePart = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `launchtab-profile-${datePart}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert(t("profileExportFailed"));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsedJson = JSON.parse(raw) as unknown;
      const { data, error } = parseShareProfile(parsedJson);

      if (!data) {
        alert(error ?? t("profileImportInvalid"));
        return;
      }

      setPendingImportProfile(data);
      setIsImportConfirmOpen(true);
    } catch {
      alert(t("profileImportInvalid"));
    }
  };

  const applyImportedProfile = () => {
    if (!pendingImportProfile) {
      return;
    }

    setIsImporting(true);

    try {
      const result = importShareProfile(pendingImportProfile);
      if (!result.applied) {
        alert(result.error ?? t("profileImportFailed"));
        return;
      }
      if (result.theme) {
        setTheme(result.theme);
      }
      setIsImportConfirmOpen(false);
      setPendingImportProfile(null);
      onOpenChange(false);
      alert(t("profileImportSuccess"));
    } catch {
      alert(t("profileImportFailed"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("profileShare")}
            </DialogTitle>
            <DialogDescription>
              {t("profileShareDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 py-4">
            <Button
              variant="outline"
              onClick={handleExportProfile}
              className="flex-1 justify-start gap-3 px-5 py-4">
              <Download className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">{t("exportProfile")}</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleImportClick}
              className="flex-1 justify-start gap-3 px-5 py-4">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">{t("importProfile")}</div>
              </div>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isImportConfirmOpen}
        onOpenChange={(open) => {
          setIsImportConfirmOpen(open);
          if (!open) {
            setPendingImportProfile(null);
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("importProfileConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("importProfileConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsImportConfirmOpen(false);
                setPendingImportProfile(null);
              }}
              disabled={isImporting}>
              {t("cancel")}
            </Button>
            <Button onClick={applyImportedProfile} disabled={isImporting}>
              {isImporting ? t("loading") : t("importProfile")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
