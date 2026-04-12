"use client";

import { useEffect, useRef, useState } from "react";
import { BellRing } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/constants/languages";
import {
  StickyAlarmEvent,
  subscribeStickyAlarmEvents,
} from "@/lib/stickyAlarmEvents";

export default function StickyAlarmDialog() {
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);
  const [activeAlarm, setActiveAlarm] = useState<StickyAlarmEvent | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return subscribeStickyAlarmEvents((event) => {
      setActiveAlarm(event);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeAlarm) {
      return;
    }

    let isCancelled = false;
    let retryIntervalId: number | null = null;
    let isPlaying = false;

    const stopRetry = () => {
      if (retryIntervalId !== null) {
        window.clearInterval(retryIntervalId);
        retryIntervalId = null;
      }
      window.removeEventListener("focus", handleVisibilityRetry);
      document.removeEventListener("visibilitychange", handleVisibilityRetry);
    };

    const tryPlayAudio = async () => {
      if (isCancelled || isPlaying) {
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      try {
        await audio.play();
        isPlaying = true;
        stopRetry();
      } catch (error) {
        console.error("Failed to autoplay alarm sound:", error);
      }
    };

    const retryPlay = () => {
      void tryPlayAudio();
    };

    retryPlay();
    retryIntervalId = window.setInterval(retryPlay, 2000);

    function handleVisibilityRetry() {
      retryPlay();
    }

    window.addEventListener("focus", handleVisibilityRetry);
    document.addEventListener("visibilitychange", handleVisibilityRetry);

    return () => {
      isCancelled = true;
      stopRetry();
      audio.pause();
      audio.currentTime = 0;
    };
  }, [activeAlarm]);

  useEffect(() => {
    if (!activeAlarm) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleRefreshShortcuts = (event: KeyboardEvent) => {
      const isReloadKey = event.key === "F5";
      const isMetaReload =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "r";
      if (isReloadKey || isMetaReload) {
        event.preventDefault();
      }
    };

    window.onbeforeunload = handleBeforeUnload;
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleRefreshShortcuts);
    return () => {
      window.onbeforeunload = null;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleRefreshShortcuts);
    };
  }, [activeAlarm]);

  const handleTurnOffAlarm = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setActiveAlarm(null);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/video/alarmsounds.mp3"
        preload="auto"
        className="hidden"
        loop
      />
      <Dialog
        open={Boolean(activeAlarm)}
        onOpenChange={(open) => {
          if (!open) {
            handleTurnOffAlarm();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              {t("stickyAlarmTitle")}
            </DialogTitle>
            <DialogDescription>
              {activeAlarm?.message || t("reminderDefaultMessage")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleTurnOffAlarm}>{t("turnOffAlarm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
