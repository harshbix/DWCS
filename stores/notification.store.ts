import { create } from 'zustand';

export interface AppNotification {
  id: string | number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  category: 'tracking' | 'payment' | 'alert' | 'general';
  icon: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'unread'>) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string | number) => void;
}

/**
 * Zustand store to manage system notifications and unread badges.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 1,
      title: 'Truck Approaching',
      message: 'The waste truck is 500m from your house. Please ensure your bins are accessible.',
      time: 'Just now',
      unread: true,
      category: 'tracking',
      icon: 'local_shipping',
    },
    {
      id: 2,
      title: 'Payment Successful',
      message: 'Receipt #8394 has been generated for your recent collection service.',
      time: '2h ago',
      unread: false,
      category: 'payment',
      icon: 'payments',
    },
    {
      id: 3,
      title: 'Service Update',
      message: 'Collection for Zone 4 shifted to Saturday due to scheduled maintenance.',
      time: 'Yesterday',
      unread: false,
      category: 'alert',
      icon: 'warning',
    },
  ],
  unreadCount: 1,
  addNotification: (notification) =>
    set((state) => {
      const newNotification: AppNotification = { ...notification, unread: true };
      const updated = [newNotification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.unread).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.unread).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, unread: false }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    }),
  removeNotification: (id) =>
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.unread).length,
      };
    }),
}));
