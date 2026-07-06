import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Zustand store to manage sidebar visibility.
 */
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
