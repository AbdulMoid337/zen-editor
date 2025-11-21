import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Note {
  id: string;
  title: string;
  content: string;
  posX?: number;
  posY?: number;
  pinned?: boolean;
}

interface Store {
  notes: Note[];
  activeId: string | null;
  createNote: () => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  togglePin: (id: string) => void;
  _hasHydrated: boolean;
}

export const useDataStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        notes: [],
        activeId: null,
        _hasHydrated: false,

        createNote: () =>
          set((state) => {
            const id = uuidv4();
            const newNote: Note = {
              id,
              title: "Untitled",
              content: "",
              posX: 0,
              posY: 0,
              pinned: false,
            };
            return {
              notes: [newNote, ...state.notes],
              activeId: id,
            };
          }),

        updateNote: (id, data) =>
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, ...data } : note
            ),
          })),

        deleteNote: (id) =>
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
            activeId: state.activeId === id ? null : state.activeId,
          })),

        setActiveNote: (id) => set(() => ({ activeId: id })),

        togglePin: (id: string) =>
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id ? { ...n, pinned: !n.pinned } : n
            ),
          })),
      }),
      {
        name: "notepad-data",
        partialize: (state) => ({
          notes: state.notes,
          activeId: state.activeId,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (state && !error) {
            state._hasHydrated = true;
          }
        },
      }
    ),
    {
      name: "NotepadStore",
    }
  )
);
