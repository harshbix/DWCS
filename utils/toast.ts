import { useNotificationStore } from '@/stores/notification.store';

/**
 * Global toast emitter utility.
 * Appends transient UI messages into the Zustand notification store.
 * These are NOT persisted to the database.
 */
export const toast = {
  success(title: string, message: string) {
    useNotificationStore.getState().addToast({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'general',
      icon: 'check_circle',
    });
  },
  error(title: string, message: string) {
    useNotificationStore.getState().addToast({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'alert',
      icon: 'error',
    });
  },
  info(title: string, message: string) {
    useNotificationStore.getState().addToast({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'general',
      icon: 'info',
    });
  },
};
