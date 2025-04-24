import { create } from 'zustand';

interface DialogState {
  addNoteOpen: boolean;
  setAddNoteOpen: (open: boolean) => void;
  addCategoryOpen: boolean;
  setAddCategoryOpen: (open: boolean) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  addNoteOpen: false,
  setAddNoteOpen: (open) => set({ addNoteOpen: open }),
  addCategoryOpen: false,
  setAddCategoryOpen: (open) => set({ addCategoryOpen: open }),
}));