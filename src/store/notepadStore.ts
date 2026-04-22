import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  alarmSetAt: string | null;
  alarmDueAt: string | null;
  alarmStatus: "none" | "scheduled" | "overdue";
  alarmMessage: string | null;
}

interface NotepadState {
  notes: Note[];
  selectedNoteId: string | null;
  addNote: (note?: Partial<Note>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setNoteAlarm: (id: string, delayMinutes: number) => boolean;
  clearNoteAlarm: (id: string) => void;
  markNoteAlarmOverdue: (id: string) => void;
  clearAll: () => void;
  resetNotepad: () => void;
}

const createAlarmMessage = (note: Pick<Note, "title" | "content">) => {
  const title = note.title.trim();
  if (title) {
    return title;
  }

  const content = note.content.trim();
  if (!content) {
    return "Sticky note reminder";
  }

  return content.length > 120 ? `${content.slice(0, 117)}...` : content;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeLegacyNote = (value: unknown): Note | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id
      : Math.random().toString(36).slice(2, 11);

  const title = typeof value.title === "string" ? value.title : "";
  const content = typeof value.content === "string" ? value.content : "";
  const updatedAt =
    typeof value.updatedAt === "string" && value.updatedAt
      ? value.updatedAt
      : new Date().toISOString();

  const alarmSetAt =
    typeof value.alarmSetAt === "string" ? value.alarmSetAt : null;
  const alarmDueAt =
    typeof value.alarmDueAt === "string" ? value.alarmDueAt : null;
  const alarmStatus =
    value.alarmStatus === "scheduled" || value.alarmStatus === "overdue"
      ? value.alarmStatus
      : "none";
  const alarmMessage =
    typeof value.alarmMessage === "string" ? value.alarmMessage : null;

  return {
    id,
    title,
    content,
    updatedAt,
    alarmSetAt: alarmStatus === "none" ? null : alarmSetAt,
    alarmDueAt: alarmStatus === "none" ? null : alarmDueAt,
    alarmStatus,
    alarmMessage: alarmStatus === "none" ? null : alarmMessage,
  };
};

export const useNotepadStore = create<NotepadState>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedNoteId: null,

      addNote: (noteData) => {
        const newNote: Note = {
          id: Math.random().toString(36).substr(2, 9),
          title: noteData?.title || "",
          content: noteData?.content || "",
          updatedAt: new Date().toISOString(),
          alarmSetAt: null,
          alarmDueAt: null,
          alarmStatus: "none",
          alarmMessage: null,
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id,
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note,
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId:
            get().selectedNoteId === id ? null : get().selectedNoteId,
        }));
      },

      selectNote: (id) => set({ selectedNoteId: id }),

      setNoteAlarm: (id, delayMinutes) => {
        if (
          !Number.isFinite(delayMinutes) ||
          delayMinutes < 1 ||
          delayMinutes > 1440
        ) {
          return false;
        }

        const targetNote = get().notes.find((note) => note.id === id);
        if (!targetNote) {
          return false;
        }

        const now = new Date();
        const dueAt = new Date(
          now.getTime() + delayMinutes * 60_000,
        ).toISOString();
        const setAt = now.toISOString();

        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  updatedAt: new Date().toISOString(),
                  alarmSetAt: setAt,
                  alarmDueAt: dueAt,
                  alarmStatus: "scheduled",
                  alarmMessage: createAlarmMessage(note),
                }
              : note,
          ),
        }));

        return true;
      },

      clearNoteAlarm: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  updatedAt: new Date().toISOString(),
                  alarmSetAt: null,
                  alarmDueAt: null,
                  alarmStatus: "none",
                  alarmMessage: null,
                }
              : note,
          ),
        }));
      },

      markNoteAlarmOverdue: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id && note.alarmStatus === "scheduled"
              ? {
                  ...note,
                  updatedAt: new Date().toISOString(),
                  alarmStatus: "overdue",
                }
              : note,
          ),
        }));
      },

      clearAll: () => set({ notes: [], selectedNoteId: null }),

      resetNotepad: () => set({ notes: [], selectedNoteId: null }),
    }),
    {
      name: "notepad-store",
      version: 3,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migration from single content to list of notes
          const oldContent =
            typeof persistedState === "object" &&
            persistedState !== null &&
            "content" in persistedState &&
            typeof (persistedState as { content?: unknown }).content ===
              "string"
              ? (persistedState as { content: string }).content
              : "";
          return {
            ...(typeof persistedState === "object" && persistedState !== null
              ? persistedState
              : {}),
            notes: oldContent
              ? [
                  {
                    id: "legacy",
                    title: "My First Note",
                    content: oldContent,
                    updatedAt: new Date().toISOString(),
                    alarmSetAt: null,
                    alarmDueAt: null,
                    alarmStatus: "none",
                    alarmMessage: null,
                  },
                ]
              : [],
            selectedNoteId: oldContent ? "legacy" : null,
          };
        }

        if (version === 2 && isRecord(persistedState)) {
          const migratedNotes = Array.isArray(persistedState.notes)
            ? persistedState.notes
                .map((candidate) => normalizeLegacyNote(candidate))
                .filter((note): note is Note => note !== null)
            : [];

          return {
            ...persistedState,
            notes: migratedNotes,
            selectedNoteId:
              typeof persistedState.selectedNoteId === "string"
                ? persistedState.selectedNoteId
                : null,
          };
        }

        if (version >= 3 && isRecord(persistedState)) {
          const normalizedNotes = Array.isArray(persistedState.notes)
            ? persistedState.notes
                .map((candidate) => normalizeLegacyNote(candidate))
                .filter((note): note is Note => note !== null)
            : [];
          return {
            ...persistedState,
            notes: normalizedNotes,
            selectedNoteId:
              typeof persistedState.selectedNoteId === "string"
                ? persistedState.selectedNoteId
                : null,
          };
        }

        return persistedState;
      },
    },
  ),
);
