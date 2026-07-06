import { frontendEnvSchema } from '@/schemas/env.schema';

/**
 * Validates and exposes frontend environment variables.
 * Throws a fatal startup error if any variables are missing.
 */
function validateEnv() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const parsed = frontendEnvSchema.safeParse(envVars);

  if (!parsed.success) {
    console.error('❌ Critical: Invalid frontend environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables. Fix the issues above to start the application.');
  }

  return parsed.data;
}

export const env = validateEnv();
export type Env = typeof env;
