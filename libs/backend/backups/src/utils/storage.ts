import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '@backend/shared';
import type { BackupsEnv } from './backups-env.js';

/**
 * Create the storage and tmp directories if missing. Idempotent; safe to
 * call on every server boot.
 */
export async function ensureBackupDirs(env: BackupsEnv): Promise<void> {
  try {
    await fs.mkdir(env.storagePath, { recursive: true });
    await fs.mkdir(env.tmpPath, { recursive: true });
  } catch (err) {
    throw new AppError(
      500,
      'BACKUP_STORAGE_ERROR',
      'No se pudo crear el directorio de respaldos',
      { cause: (err as Error).message }
    );
  }
}

/**
 * Build a deterministic file name for a backup record. The slug keeps the
 * filename readable and OS-portable.
 */
export function buildBackupFilename(opts: {
  id: string;
  name: string;
}): string {
  const slug = slugifyForFilename(opts.name);
  // Always include the id so collisions are impossible even with identical names.
  return `backup-${opts.id}-${slug || 'sin-nombre'}.enc`;
}

export function buildBackupPath(env: BackupsEnv, fileName: string): string {
  return path.join(env.storagePath, fileName);
}

export async function backupFileExists(absPath: string): Promise<boolean> {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a backup file if present. No-op when the file is already gone so
 * it can be safely chained with cleanup workflows.
 */
export async function deleteBackupFile(absPath: string): Promise<void> {
  try {
    await fs.unlink(absPath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return;
    throw new AppError(
      500,
      'BACKUP_STORAGE_ERROR',
      'No se pudo eliminar el archivo de respaldo',
      { cause: (err as Error).message }
    );
  }
}

export async function fileSize(absPath: string): Promise<number> {
  try {
    const st = await fs.stat(absPath);
    return st.size;
  } catch (err) {
    throw new AppError(
      500,
      'BACKUP_STORAGE_ERROR',
      'No se pudo obtener el tamaño del archivo',
      { cause: (err as Error).message }
    );
  }
}

/**
 * Move a file across paths. Falls back to copy + unlink when `rename` fails
 * with EXDEV (cross-device move, e.g. tmp on tmpfs vs storage on disk).
 */
export async function moveFile(srcAbs: string, destAbs: string): Promise<void> {
  try {
    await fs.rename(srcAbs, destAbs);
    return;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'EXDEV') {
      throw new AppError(
        500,
        'BACKUP_STORAGE_ERROR',
        'No se pudo mover el archivo',
        { cause: (err as Error).message }
      );
    }
  }

  // Cross-device fallback: copy then unlink the source.
  try {
    await fs.copyFile(srcAbs, destAbs);
    await fs.unlink(srcAbs);
  } catch (err) {
    throw new AppError(
      500,
      'BACKUP_STORAGE_ERROR',
      'No se pudo mover el archivo (copy+unlink falló)',
      { cause: (err as Error).message }
    );
  }
}

/**
 * Lowercase, ASCII-only slug suitable for inclusion in a filename. Strips
 * accents, replaces non `[a-z0-9-_]` runs with a single `-`, and trims.
 */
export function slugifyForFilename(s: string): string {
  return (
    s
      .normalize('NFD')
      // Strip combining diacritical marks (U+0300..U+036F) after NFD decomposition.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
  );
}
