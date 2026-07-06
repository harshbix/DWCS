import { RealtimeChannel } from '@supabase/supabase-js';

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: Error;
}

/**
 * Manages the connection lifecycle of a Supabase Realtime Channel.
 */
export class RealtimeConnectionManager {
  private channel: RealtimeChannel | null = null;
  private onStatusChangeCallbacks: ((state: ConnectionState) => void)[] = [];

  constructor(channel: RealtimeChannel | null) {
    this.channel = channel;
  }

  /**
   * Subscribes to the channel and tracks its connection state.
   */
  public connect(): void {
    if (!this.channel) return;

    this.emitStatus({ status: 'connecting' });

    this.channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        this.emitStatus({ status: 'connected' });
      } else if (status === 'CLOSED') {
        this.emitStatus({ status: 'disconnected' });
      } else if (status === 'CHANNEL_ERROR') {
        this.emitStatus({ status: 'error', error: err || new Error('Realtime channel error') });
      }
    });
  }

  /**
   * Unsubscribes and cleans up channel observers.
   */
  public disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.emitStatus({ status: 'disconnected' });
    }
  }

  /**
   * Registers a status change observer callback.
   */
  public onStatusChange(callback: (state: ConnectionState) => void): () => void {
    this.onStatusChangeCallbacks.push(callback);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  private emitStatus(state: ConnectionState): void {
    this.onStatusChangeCallbacks.forEach((cb) => cb(state));
  }
}
