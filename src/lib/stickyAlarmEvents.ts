export interface StickyAlarmEvent {
  noteId: string;
  title: string;
  message: string;
  dueAt: string;
}

type StickyAlarmListener = (event: StickyAlarmEvent) => void;

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

