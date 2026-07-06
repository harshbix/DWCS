import { create } from 'zustand';

export type UserRole = 'citizen' | 'driver' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  zone?: string;
  plateNumber?: string;
}

interface AuthState {
  role: UserRole;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  setUser: (user: AuthUser | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

/**
 * Zustand store to manage user session authentication and local role layouts.
 */
export const useAuthStore = create<AuthState>((set) => ({
  role: 'citizen',
  user: {
    id: 'usr_001',
    email: 'elias.mwakalebela@example.com',
    name: 'Elias Mwakalebela',
    phone: '+255 783 222 111',
    zone: 'Temeke, Zone 4',
  },
  isAuthenticated: true,
  isLoading: false,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, role: 'citizen' }),
}));
