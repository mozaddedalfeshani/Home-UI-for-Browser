export interface StickyAlarmEvent {
  noteId: string;
  title: string;
  message: string;
  dueAt: string;
}

type StickyAlarmListener = (event: StickyAlarmEvent) => void;

const ACTIVE_ALARM_KEY = "sticky-alarm-active";
const ACTIVE_ALARM_FLAG_KEY = "sticky-alarm-running";

const listeners = new Set<StickyAlarmListener>();

export const publishStickyAlarmEvent = (event: StickyAlarmEvent) => {
  for (const listener of listeners) {
    listener(event);
  }
};

export const subscribeStickyAlarmEvents = (listener: StickyAlarmListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const persistStickyAlarmEvent = (event: StickyAlarmEvent | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (event) {
    window.localStorage.setItem(ACTIVE_ALARM_KEY, JSON.stringify(event));
    window.localStorage.setItem(ACTIVE_ALARM_FLAG_KEY, "true");
  } else {
    window.localStorage.removeItem(ACTIVE_ALARM_KEY);
    window.localStorage.setItem(ACTIVE_ALARM_FLAG_KEY, "false");
  }
};

export const getPersistedStickyAlarmEvent = (): StickyAlarmEvent | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ACTIVE_ALARM_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StickyAlarmEvent;
    if (
      typeof parsed.noteId === "string" &&
      typeof parsed.title === "string" &&
      typeof parsed.message === "string" &&
      typeof parsed.dueAt === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const isStickyAlarmRunning = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ACTIVE_ALARM_FLAG_KEY) === "true";
};
