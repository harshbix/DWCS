import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for client-side (browser) components.
 */
export const createBrowserSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing on client initialization');
  }

  return createBrowserClient(url, anonKey);
};
