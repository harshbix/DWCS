import { create } from 'zustand';

interface ThemeState {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
}

/**
 * Zustand store to manage active visual theme mode.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'light',
  toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
  setTheme: (mode) => set({ themeMode: mode }),
}));
