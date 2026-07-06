import { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js';

/**
 * Sends a client-to-client broadcast message over a Supabase Realtime Channel.
 */
export async function broadcastEvent<T = unknown>(
  channel: RealtimeChannel,
  event: string,
  payload: T
): Promise<RealtimeChannelSendResponse> {
  return channel.send({
    type: 'broadcast',
    event,
    payload,
  });
}
