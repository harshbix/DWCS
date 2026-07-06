import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

/**
 * Zustand store to manage global loading overlays.
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingMessage: null,
  startLoading: (message = 'Loading...') => set({ isLoading: true, loadingMessage: message }),
  stopLoading: () => set({ isLoading: false, loadingMessage: null }),
}));
