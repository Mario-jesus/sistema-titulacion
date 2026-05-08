import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { AppError } from '@backend/shared';

/**
 * Stream a file through SHA-256 and return the lowercase hex digest. Avoids
 * loading the file into memory so it works for arbitrarily large backups.
 */
export async function fileSha256Hex(filePath: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('error', (err) => {
      reject(
        new AppError(
          500,
          'CHECKSUM_ERROR',
          'No se pudo leer el archivo para calcular SHA-256',
          { cause: err.message }
        )
      );
    });
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
}

/**
 * In-memory SHA-256 helper for small payloads (config blobs, manifests).
 */
export function bufferSha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}
