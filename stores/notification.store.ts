import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'tracking' | 'payment' | 'alert' | 'general';
  icon: string;
  unread: boolean;
}

interface NotificationState {
  /** UI-only toast messages injected by app actions. Not persisted to DB. */
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'unread'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Zustand store for transient UI toast messages only.
 * 
 * Database notifications (from public.notification_recipients) are managed
 * exclusively by hooks/useNotifications.ts via TanStack Query.
 * 
 * Do NOT add mock/hardcoded notifications here.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [{ ...toast, unread: true }, ...state.toasts].slice(0, 20), // cap at 20 toasts
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
