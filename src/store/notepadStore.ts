import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotepadState {
  content: string;
  setContent: (content: string) => void;
  clearContent: () => void;
}

export const useNotepadStore = create<NotepadState>()(
  persist(
    (set) => ({
      content: "",
      setContent: (content) => set({ content }),
      clearContent: () => set({ content: "" }),
    }),
    {
      name: "notepad-store",
      version: 1,
    }
  )
);
