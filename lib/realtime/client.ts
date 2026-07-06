import { createBrowserSupabaseClient } from '../supabase/browser';

/**
 * Initializes and retrieves the Supabase Realtime Channel client.
 */
export const getRealtimeChannel = (channelName: string) => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const supabase = createBrowserSupabaseClient();
  return supabase.channel(channelName);
};
