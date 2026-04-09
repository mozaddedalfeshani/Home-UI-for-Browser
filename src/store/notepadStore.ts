import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface NotepadState {
  notes: Note[];
  selectedNoteId: string | null;
  addNote: (note?: Partial<Note>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  clearAll: () => void;
  resetNotepad: () => void;
}

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
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id,
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId: get().selectedNoteId === id ? null : get().selectedNoteId,
        }));
      },

      selectNote: (id) => set({ selectedNoteId: id }),

      clearAll: () => set({ notes: [], selectedNoteId: null }),

      resetNotepad: () => set({ notes: [], selectedNoteId: null }),
    }),
    {
      name: "notepad-store",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          // Migration from single content to list of notes
          const oldContent =
            typeof persistedState === "object" &&
            persistedState !== null &&
            "content" in persistedState &&
            typeof (persistedState as { content?: unknown }).content === "string"
              ? (persistedState as { content: string }).content
              : "";
          return {
            ...(typeof persistedState === "object" && persistedState !== null
              ? persistedState
              : {}),
            notes: oldContent ? [{
              id: "legacy",
              title: "My First Note",
              content: oldContent,
              updatedAt: new Date().toISOString(),
            }] : [],
            selectedNoteId: oldContent ? "legacy" : null,
          };
        }
        return persistedState;
      },
    }
  )
);
