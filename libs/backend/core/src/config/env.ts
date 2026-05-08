import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z
    .string()
    .min(1)
    .default('mongodb://localhost:27017/sistema-titulacion'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  /** Comma-separated origins for CORS, or "*" to allow all. Default: http://localhost:4200 (Vite dev con NX) */
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  /** JWT secret for signing tokens */
  JWT_SECRET: z.string().min(1).default('change-me-in-production'),
  /** Access token expiry in seconds (default 1 hour) */
  JWT_ACCESS_EXPIRES: z.coerce.number().int().positive().default(3600),
  /** Refresh token expiry in seconds (default 7 days) */
  JWT_REFRESH_EXPIRES: z.coerce.number().int().positive().default(604800),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
