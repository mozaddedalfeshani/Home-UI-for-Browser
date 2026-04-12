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
  getPersistedStickyAlarmEvent,
  isStickyAlarmRunning,
  persistStickyAlarmEvent,
  subscribeStickyAlarmEvents,
} from "@/lib/stickyAlarmEvents";

export default function StickyAlarmDialog() {
  const language = useSettingsStore((state) => state.language);
  const t = useTranslation(language);
  const [activeAlarm, setActiveAlarm] = useState<StickyAlarmEvent | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const persistedAlarm = getPersistedStickyAlarmEvent();
    if (persistedAlarm) {
      setActiveAlarm(persistedAlarm);
      persistStickyAlarmEvent(persistedAlarm);
    }

    return subscribeStickyAlarmEvents((event) => {
      setActiveAlarm(event);
      persistStickyAlarmEvent(event);
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
  }, [activeAlarm, t]);

  useEffect(() => {
    const shouldBlockUnload = () => isStickyAlarmRunning();

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockUnload()) {
        return;
      }
      event.preventDefault();
      event.returnValue = true;
    };

    const handleBeforeUnloadProperty = () => {
      if (!shouldBlockUnload()) {
        return undefined;
      }
      return true;
    };

    const handleRefreshShortcuts = (event: KeyboardEvent) => {
      if (!shouldBlockUnload()) {
        return;
      }

      const isReloadKey = event.key === "F5";
      const isMetaReload =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "r";
      const isMetaClose =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "w";
      if (isReloadKey || isMetaReload || isMetaClose) {
        event.preventDefault();
      }
    };

    window.onbeforeunload = handleBeforeUnloadProperty;
    const bodyWithBeforeUnload = document.body as
      | (HTMLBodyElement & {
          onbeforeunload: ((event: BeforeUnloadEvent) => unknown) | null;
        })
      | null;
    if (bodyWithBeforeUnload) {
      bodyWithBeforeUnload.onbeforeunload = handleBeforeUnloadProperty;
    }
    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });
    window.addEventListener("keydown", handleRefreshShortcuts, { capture: true });
    document.addEventListener("keydown", handleRefreshShortcuts, { capture: true });
    return () => {
      window.onbeforeunload = null;
      if (bodyWithBeforeUnload) {
        bodyWithBeforeUnload.onbeforeunload = null;
      }
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
      window.removeEventListener("keydown", handleRefreshShortcuts, { capture: true });
      document.removeEventListener("keydown", handleRefreshShortcuts, { capture: true });
    };
  }, []);

  const handleTurnOffAlarm = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    persistStickyAlarmEvent(null);
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
