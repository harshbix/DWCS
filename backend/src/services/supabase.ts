import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Express Backend Supabase client.
 * Configured with service role credentials to allow elevated server operations.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
