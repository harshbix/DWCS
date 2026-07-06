import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env if present
dotenv.config();

const backendEnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().default('*'),
});

/**
 * Validates backend process environment variables.
 * Exits immediately if validation fails to prevent startup with bad configs.
 */
function validateEnv() {
  const parsed = backendEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Critical: Invalid backend environment configurations:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
export type Env = typeof env;
