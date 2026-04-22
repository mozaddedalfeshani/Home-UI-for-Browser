"use client";

import { useEffect, useRef } from "react";
import { useNotepadStore } from "@/store/notepadStore";
import { publishStickyAlarmEvent } from "@/lib/stickyAlarmEvents";

type TimerEntry = {
  dueAt: string;
  timeoutId: number;
};

const notifyStickyNoteReminder = async (title: string, body: string) => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, { body });
      }
    } catch {
      // console.error("Notification permission request failed:", error);
    }
  }
};

export const useStickyNoteAlarms = () => {
  const notes = useNotepadStore((state) => state.notes);
  const markNoteAlarmOverdue = useNotepadStore(
    (state) => state.markNoteAlarmOverdue,
  );

  const timersRef = useRef<Map<string, TimerEntry>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    const scheduledNotes = notes.filter(
      (note) => note.alarmStatus === "scheduled" && note.alarmDueAt,
    );
    const scheduledIds = new Set(scheduledNotes.map((note) => note.id));

    for (const [noteId, timer] of timers.entries()) {
      if (!scheduledIds.has(noteId)) {
        window.clearTimeout(timer.timeoutId);
        timers.delete(noteId);
      }
    }

    for (const note of scheduledNotes) {
      if (!note.alarmDueAt) {
        continue;
      }

      const dueTimeMs = new Date(note.alarmDueAt).getTime();
      if (Number.isNaN(dueTimeMs)) {
        markNoteAlarmOverdue(note.id);
        continue;
      }

      const delayMs = dueTimeMs - Date.now();
      if (delayMs <= 0) {
        markNoteAlarmOverdue(note.id);
        continue;
      }

      const existing = timers.get(note.id);
      if (existing && existing.dueAt === note.alarmDueAt) {
        continue;
      }

      if (existing) {
        window.clearTimeout(existing.timeoutId);
      }

      const timeoutId = window.setTimeout(() => {
        const alarmTitle = note.title || "Sticky Note Reminder";
        const alarmMessage =
          note.alarmMessage || note.title || "Reminder due now";

        publishStickyAlarmEvent({
          noteId: note.id,
          title: alarmTitle,
          message: alarmMessage,
          dueAt: note.alarmDueAt || new Date().toISOString(),
        });

        notifyStickyNoteReminder("Sticky Note Reminder", alarmMessage);
        markNoteAlarmOverdue(note.id);
        timersRef.current.delete(note.id);
      }, delayMs);

      timers.set(note.id, { dueAt: note.alarmDueAt, timeoutId });
    }

    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer.timeoutId);
      }
      timers.clear();
    };
  }, [notes, markNoteAlarmOverdue]);
};
