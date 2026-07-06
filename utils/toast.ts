import { useNotificationStore } from '@/stores/notification.store';

/**
 * Global toast emitter utility.
 * Appends messages directly into the Zustand notifications store feed.
 */
export const toast = {
  success(title: string, message: string) {
    useNotificationStore.getState().addNotification({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'general',
      icon: 'check_circle',
    });
  },
  error(title: string, message: string) {
    useNotificationStore.getState().addNotification({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'alert',
      icon: 'error',
    });
  },
  info(title: string, message: string) {
    useNotificationStore.getState().addNotification({
      id: String(Date.now()),
      title,
      message,
      time: 'Just now',
      category: 'general',
      icon: 'info',
    });
  },
};
