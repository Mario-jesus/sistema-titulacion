import path from 'node:path';
import { z } from 'zod';
import { AppError } from '@backend/shared';

/**
 * Resolved configuration for the backups module. All paths are absolute.
 */
export interface BackupsEnv {
  /** Absolute directory where encrypted `.enc` backup files are stored. */
  storagePath: string;
  /** Absolute directory used to write temporary files during encrypt/decrypt. */
  tmpPath: string;
  /** AES-256-GCM key, exactly 32 bytes (already base64-decoded). */
  key: Buffer;
  /** Days to keep backups before being eligible for cleanup. */
  retentionDays: number;
  /** Maximum upload size in bytes for restore operations. */
  maxUploadBytes: number;
}

/**
 * Schema for backup-specific environment variables.
 * Only `BACKUP_ENCRYPTION_KEY_BASE64` is required; everything else has defaults.
 * Note: numeric coercion lives here to keep the boundary between `process.env`
 * (always strings) and the typed config explicit.
 */
const backupsEnvSchema = z.object({
  BACKUP_STORAGE_PATH: z.string().min(1).default('./var/backups'),
  BACKUP_TMP_PATH: z.string().min(1).default('./var/backups/tmp'),
  BACKUP_ENCRYPTION_KEY_BASE64: z.string().min(1, {
    message: 'BACKUP_ENCRYPTION_KEY_BASE64 es requerido',
  }),
  BACKUP_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  BACKUP_MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(1_073_741_824),
});

let cached: BackupsEnv | null = null;

/**
 * Load and validate backups-specific environment variables. The result is
 * memoized for subsequent calls so reading is cheap. Throws AppError(500)
 * with a stable code on any validation failure.
 */
export function loadBackupsEnv(): BackupsEnv {
  if (cached !== null) {
    return cached;
  }

  const parsed = backupsEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError(
      500,
      'BACKUP_ENV_INVALID',
      'Configuración de backups inválida',
      parsed.error.issues
    );
  }

  const data = parsed.data;

  // Validate the encryption key length precisely. base64 silently accepts
  // padding/whitespace so we must check the decoded buffer size directly.
  const key = Buffer.from(data.BACKUP_ENCRYPTION_KEY_BASE64, 'base64');
  if (key.length !== 32) {
    throw new AppError(
      500,
      'BACKUP_ENV_INVALID',
      'BACKUP_ENCRYPTION_KEY_BASE64 debe ser 32 bytes en base64'
    );
  }

  const storagePath = path.resolve(process.cwd(), data.BACKUP_STORAGE_PATH);
  const tmpPath = path.resolve(process.cwd(), data.BACKUP_TMP_PATH);

  cached = {
    storagePath,
    tmpPath,
    key,
    retentionDays: data.BACKUP_RETENTION_DAYS,
    maxUploadBytes: data.BACKUP_MAX_UPLOAD_BYTES,
  };

  return cached;
}

/**
 * Reset the memoized config. Mostly useful for tests that mutate
 * `process.env` between cases.
 */
export function resetBackupsEnvCache(): void {
  cached = null;
}
