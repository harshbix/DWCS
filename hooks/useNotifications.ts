import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import type { NotificationItem } from '@/types/database';

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (recipientId: string) => void;
  markAllAsRead: () => void;
}

/**
 * Hook to retrieve user notifications from the database and subscribe
 * to realtime updates via Supabase channels.
 */
export function useNotifications(userId?: string): UseNotificationsReturn {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  const queryKey = ['notifications', userId];

  // Fetch notifications from notification_recipients + notifications join
  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey,
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('notification_recipients')
        .select('id, is_read, created_at, notifications(title, message, type)')
        .eq('recipient_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      return (data ?? []).map((item: any) => ({
        id: item.id,
        title: item.notifications?.title ?? 'System Notification',
        message: item.notifications?.message ?? '',
        type: (item.notifications?.type ?? 'announcement') as NotificationItem['type'],
        isRead: item.is_read,
        createdAt: item.created_at,
      }));
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });

  // Supabase Realtime subscription — invalidate query on new notification
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_recipients',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', recipientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mark all as read in a single batch update
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from('notification_recipients')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
  };
}
