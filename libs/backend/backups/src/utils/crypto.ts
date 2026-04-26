import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from 'node:crypto';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { AppError } from '@backend/shared';

const pipelineAsync = promisify(pipeline);

/** Layout: [1 byte version][12 bytes IV][16 bytes authTag][N bytes ciphertext]. */
export const BACKUP_FILE_VERSION = 0x01;
export const IV_BYTES = 12;
export const AUTH_TAG_BYTES = 16;
export const HEADER_BYTES = 1 + IV_BYTES + AUTH_TAG_BYTES;

interface EncryptStreamOpts {
  source: NodeJS.ReadableStream;
  destPath: string;
  /** 32 bytes AES-256 key. */
  key: Buffer;
}

interface DecryptStreamOpts {
  srcPath: string;
  /** 32 bytes AES-256 key. */
  key: Buffer;
}

/**
 * Encrypt a readable stream (already gzip-compressed by the caller) into
 * `destPath`. Returns the IV and authTag (hex) plus the size of the final
 * `.enc` file (header + ciphertext).
 *
 * Implementation note: GCM only produces the authTag after `cipher.final()`,
 * but our header places the tag BEFORE the ciphertext. We therefore stream
 * the ciphertext to a temp file alongside `destPath`, capture the tag at
 * the end, and then write `[version][iv][authTag]` followed by streaming
 * the ciphertext into the final file. This avoids buffering the entire
 * ciphertext in memory for arbitrarily large backups.
 */
export async function encryptStreamToFile(
  opts: EncryptStreamOpts
): Promise<{ ivHex: string; authTagHex: string; sizeBytes: number }> {
  const { source, destPath, key } = opts;

  if (key.length !== 32) {
    throw new AppError(500, 'CRYPTO_ERROR', 'Clave de cifrado inválida');
  }

  const iv = randomBytes(IV_BYTES);
  const tmpCipherPath = `${destPath}.${randomUUID()}.cipher.tmp`;

  let authTag: Buffer;
  try {
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const cipherTmpStream = createWriteStream(tmpCipherPath);

    try {
      await pipelineAsync(source, cipher, cipherTmpStream);
    } catch (err) {
      throw new AppError(500, 'CRYPTO_ERROR', 'Falló el cifrado del respaldo', {
        cause: (err as Error).message,
      });
    }

    authTag = cipher.getAuthTag();
    if (authTag.length !== AUTH_TAG_BYTES) {
      throw new AppError(
        500,
        'CRYPTO_ERROR',
        'authTag GCM con tamaño inesperado'
      );
    }

    // Build the final file: header + ciphertext (streamed from tmp).
    const header = Buffer.concat([
      Buffer.from([BACKUP_FILE_VERSION]),
      iv,
      authTag,
    ]);

    const finalStream = createWriteStream(destPath);
    try {
      // Write the header synchronously before piping the cipher payload.
      await new Promise<void>((resolve, reject) => {
        finalStream.write(header, (err) => (err ? reject(err) : resolve()));
      });
      await pipelineAsync(createReadStream(tmpCipherPath), finalStream);
    } catch (err) {
      // Best-effort cleanup of the partial dest file.
      try {
        await fs.unlink(destPath);
      } catch {
        /* ignore */
      }
      throw new AppError(
        500,
        'CRYPTO_ERROR',
        'Falló al ensamblar el archivo de respaldo',
        { cause: (err as Error).message }
      );
    }

    const stat = await fs.stat(destPath);
    return {
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      sizeBytes: stat.size,
    };
  } finally {
    // Best-effort cleanup of the cipher tmp regardless of outcome.
    try {
      await fs.unlink(tmpCipherPath);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Decrypt a backup `.enc` file and return a readable stream of plaintext
 * (the caller is expected to gunzip it). Throws AppError(400) if the file
 * is too short or has an unsupported version. The returned stream emits
 * 'error' if GCM authentication fails on `.final()`.
 */
export async function decryptFileToStream(
  opts: DecryptStreamOpts
): Promise<NodeJS.ReadableStream> {
  const { srcPath, key } = opts;

  if (key.length !== 32) {
    throw new AppError(500, 'CRYPTO_ERROR', 'Clave de cifrado inválida');
  }

  const header = await readBackupHeaderRaw(srcPath);

  const decipher = createDecipheriv('aes-256-gcm', key, header.iv);
  decipher.setAuthTag(header.authTag);

  const cipherStream = createReadStream(srcPath, { start: HEADER_BYTES });

  // Pipe cipherStream through decipher. We return the decipher Readable side.
  // If the auth tag is invalid, decipher.final() will emit 'error' on this
  // stream — consumers must handle 'error' as documented.
  cipherStream.on('error', (err) => {
    decipher.destroy(err);
  });
  cipherStream.pipe(decipher);

  return decipher;
}

/**
 * Read just the header (version, IV, authTag) of a backup file without
 * consuming its body. Useful for upload validation where we want to
 * reject malformed files before attempting a full decrypt.
 */
export async function readBackupHeader(
  srcPath: string
): Promise<{ version: number; ivHex: string; authTagHex: string }> {
  const { version, iv, authTag } = await readBackupHeaderRaw(srcPath);
  return {
    version,
    ivHex: iv.toString('hex'),
    authTagHex: authTag.toString('hex'),
  };
}

/**
 * Internal helper that returns the raw Buffers; centralises the header
 * parsing and validation logic shared between decrypt and the public
 * `readBackupHeader` accessor.
 */
async function readBackupHeaderRaw(srcPath: string): Promise<{
  version: number;
  iv: Buffer;
  authTag: Buffer;
}> {
  let stat;
  try {
    stat = await fs.stat(srcPath);
  } catch (err) {
    throw new AppError(
      400,
      'INVALID_BACKUP_FILE',
      'Archivo de respaldo no encontrado',
      { cause: (err as Error).message }
    );
  }

  if (stat.size < HEADER_BYTES) {
    throw new AppError(
      400,
      'INVALID_BACKUP_FILE',
      'Archivo de respaldo truncado: faltan bytes de cabecera'
    );
  }

  const fh = await fs.open(srcPath, 'r');
  let buf: Buffer;
  try {
    buf = Buffer.alloc(HEADER_BYTES);
    const { bytesRead } = await fh.read(buf, 0, HEADER_BYTES, 0);
    if (bytesRead !== HEADER_BYTES) {
      throw new AppError(
        400,
        'INVALID_BACKUP_FILE',
        'No se pudo leer la cabecera completa del respaldo'
      );
    }
  } finally {
    await fh.close();
  }

  const version = buf.readUInt8(0);
  if (version !== BACKUP_FILE_VERSION) {
    throw new AppError(
      400,
      'INVALID_BACKUP_FILE',
      `Versión de respaldo no soportada: 0x${version.toString(16)}`
    );
  }

  const iv = buf.subarray(1, 1 + IV_BYTES);
  const authTag = buf.subarray(1 + IV_BYTES, HEADER_BYTES);

  return { version, iv: Buffer.from(iv), authTag: Buffer.from(authTag) };
}
