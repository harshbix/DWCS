import { create } from 'zustand';

export type UserRole = 'citizen' | 'driver' | 'admin';

interface AuthState {
  role: UserRole;
  activeOrganizationId: string | null;
  setRole: (role: UserRole) => void;
  setOrganizationId: (orgId: string | null) => void;
}

/**
 * Zustand store targeting client UI states, layout selectors, and organization variables.
 * Authentication state is delegated directly to TanStack Query and Supabase Cookies.
 */
export const useAuthStore = create<AuthState>((set) => ({
  role: 'citizen',
  activeOrganizationId: null,
  setRole: (role) => set({ role }),
  setOrganizationId: (activeOrganizationId) => set({ activeOrganizationId }),
}));
