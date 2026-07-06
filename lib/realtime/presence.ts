import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceUser {
  presenceRef: string;
  userId: string;
  name: string;
  onlineAt: string;
  [key: string]: unknown;
}

/**
 * Monitors active users/drivers synced in a channel using Supabase Presence.
 */
export class PresenceTracker {
  private channel: RealtimeChannel;
  private onSyncCallbacks: ((users: PresenceUser[]) => void)[] = [];

  constructor(channel: RealtimeChannel) {
    this.channel = channel;
    this.setupListeners();
  }

  /**
   * Registers a sync callback that outputs the list of active users when presence state shifts.
   */
  public onSync(callback: (users: PresenceUser[]) => void): () => void {
    this.onSyncCallbacks.push(callback);
    return () => {
      this.onSyncCallbacks = this.onSyncCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Begins tracking the user state in the channel.
   */
  public trackSelf(userId: string, metadata: Omit<PresenceUser, 'presenceRef' | 'userId' | 'onlineAt'>): void {
    this.channel.track({
      userId,
      onlineAt: new Date().toISOString(),
      ...metadata,
    });
  }

  private setupListeners(): void {
    this.channel.on('presence', { event: 'sync' }, () => {
      const presenceState = this.channel.presenceState();
      const activeUsers: PresenceUser[] = [];

      Object.entries(presenceState).forEach(([presenceRef, list]) => {
        list.forEach((item: any) => {
          activeUsers.push({
            presenceRef,
            userId: item.userId || 'unknown',
            name: item.name || 'Anonymous',
            onlineAt: item.onlineAt || new Date().toISOString(),
            ...item,
          });
        });
      });

      this.onSyncCallbacks.forEach((cb) => cb(activeUsers));
    });
  }
}
