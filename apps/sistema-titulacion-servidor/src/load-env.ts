import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

/**
 * Load .env from the server app directory so the server reads its own config.
 * Tries: apps/sistema-titulacion-servidor/.env (when cwd is workspace root),
 * then .env in cwd (when running from server directory).
 */
const serverEnvPath = path.join(
  process.cwd(),
  'apps',
  'sistema-titulacion-servidor',
  '.env'
);
const localEnvPath = path.join(process.cwd(), '.env');
const envPath = existsSync(serverEnvPath) ? serverEnvPath : localEnvPath;

config({ path: envPath });

// Build MONGODB_URI from separate vars if not set
if (
  !process.env.MONGODB_URI &&
  process.env.MONGODB_HOST &&
  process.env.DATABASE_NAME
) {
  const host = process.env.MONGODB_HOST.replace(/^mongodb:\/\//, '').replace(
    /\/$/,
    ''
  );
  const db = process.env.DATABASE_NAME;
  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const authSource = process.env.MONGODB_AUTH_SOURCE;
  if (user && password) {
    process.env.MONGODB_URI = `mongodb://${encodeURIComponent(
      user
    )}:${encodeURIComponent(password)}@${host}/${db}?authSource=${authSource}`;
  } else {
    process.env.MONGODB_URI = `mongodb://${host}/${db}`;
  }
}
