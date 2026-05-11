import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';
import { env } from '@backend/core';
import { AppError } from '@backend/shared';
import mongoose, { type Model } from 'mongoose';
import type { IBackup } from './models/Backup.model.js';
import type { BackupStatus } from './models/Backup.model.js';
import type {
  CreateBackupInput,
  ListBackupsQueryInput,
} from './schemas/backups.schemas.js';
import {
  backupFileExists,
  buildBackupFilename,
  buildBackupPath,
  buildPagination,
  decryptFileToStream,
  deleteBackupFile,
  encryptStreamToFile,
  ensureBackupDirs,
  fileSha256Hex,
  loadBackupsEnv,
  moveFile,
  readBackupHeader,
  restoreMutex,
  slugifyForFilename,
  type PaginationResult,
} from './utils/index.js';

type BackupDoc = {
  _id?: { toString: () => string };
  id?: string;
  name: string;
  description: string;
  status: BackupStatus;
  size: number;
  tablesCount: number;
  recordsCount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  createdBy: string;
  filePath: string | null;
  checksum: string | null;
};

export interface BackupPublic {
  id: string;
  name: string;
  description: string | null;
  status: BackupStatus;
  size: number;
  tablesCount: number;
  recordsCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  createdBy: string;
  filePath: string | null;
  checksum: string | null;
}

export interface IngestUploadOptions {
  tmpPath: string;
  originalName: string;
  size: number;
  name?: string;
  description?: string;
  createdBy: string;
}

export interface DownloadStreamResult {
  stream: NodeJS.ReadableStream;
  filename: string;
  size: number;
}

export class BackupsService {
  constructor(private readonly backupModel: Model<IBackup>) {}

  async listBackups(
    query: ListBackupsQueryInput
  ): Promise<{ data: BackupPublic[]; pagination: PaginationResult }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || query.q?.trim();

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.backupModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.backupModel.countDocuments(filter),
    ]);

    return {
      data: items.map((item) => toBackupPublic(item as BackupDoc)),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getBackupById(id: string): Promise<BackupPublic> {
    const backup = await this.backupModel.findById(id).lean().exec();
    if (!backup) {
      throw new AppError(404, 'BACKUP_NOT_FOUND', 'Respaldo no encontrado');
    }
    return toBackupPublic(backup as BackupDoc);
  }

  async createBackup(
    input: CreateBackupInput,
    createdBy: string
  ): Promise<BackupPublic> {
    await assertToolAvailable('mongodump');
    const backupsEnv = loadBackupsEnv();
    await ensureBackupDirs(backupsEnv);

    const backup = await this.backupModel.create({
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      status: 'IN_PROGRESS',
      size: 0,
      tablesCount: 0,
      recordsCount: 0,
      completedAt: null,
      createdBy,
      filePath: null,
      checksum: null,
      iv: null,
      authTag: null,
      errorMessage: null,
    });

    const backupId = backup._id.toString();
    void this.runBackupCreationJob(backupId);

    const fresh = await this.backupModel.findById(backupId).lean().exec();
    return toBackupPublic((fresh ?? backup.toObject()) as BackupDoc);
  }

  async deleteBackup(id: string): Promise<void> {
    const backup = await this.backupModel.findById(id).exec();
    if (!backup) {
      throw new AppError(404, 'BACKUP_NOT_FOUND', 'Respaldo no encontrado');
    }
    if (backup.status === 'IN_PROGRESS') {
      throw new AppError(
        409,
        'BACKUP_IN_PROGRESS',
        'No se puede eliminar un respaldo en progreso'
      );
    }

    if (backup.filePath) {
      await deleteBackupFile(backup.filePath);
    }

    await this.backupModel.deleteOne({ _id: backup._id });
  }

  async getDownloadStream(id: string): Promise<DownloadStreamResult> {
    const backup = await this.backupModel.findById(id).exec();
    if (!backup) {
      throw new AppError(404, 'BACKUP_NOT_FOUND', 'Respaldo no encontrado');
    }
    if (backup.status !== 'AVAILABLE' || !backup.filePath) {
      throw new AppError(
        400,
        'BACKUP_NOT_AVAILABLE',
        'El respaldo no está disponible para descarga'
      );
    }

    const exists = await backupFileExists(backup.filePath);
    if (!exists) {
      backup.status = 'UNAVAILABLE';
      backup.filePath = null;
      await backup.save();
      throw new AppError(
        404,
        'BACKUP_FILE_MISSING',
        'El archivo de respaldo no existe en disco'
      );
    }

    const filename = `${slugifyForFilename(backup.name) || 'respaldo'}.enc`;
    const stat = await fs.stat(backup.filePath);
    return {
      stream: createReadStream(backup.filePath),
      filename,
      size: stat.size,
    };
  }

  async restoreBackup(
    id: string
  ): Promise<{ message: string; backupId: string }> {
    const backup = await this.backupModel.findById(id).exec();
    if (!backup) {
      throw new AppError(404, 'BACKUP_NOT_FOUND', 'Respaldo no encontrado');
    }
    if (backup.status !== 'AVAILABLE') {
      throw new AppError(
        400,
        'BACKUP_NOT_AVAILABLE',
        'El respaldo no está disponible para restauración'
      );
    }
    if (!backup.filePath || !(await backupFileExists(backup.filePath))) {
      throw new AppError(
        404,
        'BACKUP_FILE_MISSING',
        'El archivo de respaldo no existe en disco'
      );
    }
    if (!restoreMutex.tryAcquire()) {
      throw new AppError(
        409,
        'RESTORE_IN_PROGRESS',
        'Ya hay una restauración en progreso'
      );
    }

    try {
      await assertToolAvailable('mongorestore');
      const backupsEnv = loadBackupsEnv();
      const decryptedStream = await decryptFileToStream({
        srcPath: backup.filePath,
        key: backupsEnv.key,
      });

      const restoreProcess = spawn(
        'mongorestore',
        ['--uri', env.MONGODB_URI, '--archive', '--drop'],
        {
          stdio: ['pipe', 'ignore', 'pipe'],
        }
      );

      if (!restoreProcess.stdin) {
        throw new AppError(
          500,
          'RESTORE_FAILED',
          'No se pudo abrir stdin de mongorestore'
        );
      }

      await Promise.all([
        pipeline(decryptedStream, createGunzip(), restoreProcess.stdin),
        waitForProcess(restoreProcess, 'RESTORE_FAILED', 'Falló mongorestore'),
      ]);

      const restoredStats = await getDatabaseStatsSafe();
      backup.tablesCount = restoredStats.tablesCount;
      backup.recordsCount = restoredStats.recordsCount;
      await backup.save();

      return {
        message: 'Restauración completada',
        backupId: id,
      };
    } catch (error) {
      if (
        error instanceof AppError &&
        [
          'BACKUP_NOT_FOUND',
          'BACKUP_NOT_AVAILABLE',
          'BACKUP_FILE_MISSING',
          'BACKUP_TOOL_UNAVAILABLE',
          'BACKUP_ENV_INVALID',
        ].includes(error.code)
      ) {
        throw error;
      }
      const details = error instanceof AppError ? error.details : undefined;
      throw new AppError(
        500,
        'RESTORE_FAILED',
        'Ocurrió un error al restaurar el respaldo',
        details
      );
    } finally {
      restoreMutex.release();
    }
  }

  async ingestUploadedBackup(opts: IngestUploadOptions): Promise<BackupPublic> {
    const backupsEnv = loadBackupsEnv();
    await ensureBackupDirs(backupsEnv);

    if (opts.size <= 29) {
      throw new AppError(
        400,
        'INVALID_BACKUP_FILE',
        'El archivo de respaldo es demasiado pequeño'
      );
    }

    const header = await readBackupHeader(opts.tmpPath);
    const backupObjectId = new mongoose.Types.ObjectId();
    const backupId = backupObjectId.toString();
    const nameFromFile = opts.originalName.replace(/\.enc$/i, '').trim();
    const resolvedName = (
      opts.name?.trim() ||
      nameFromFile ||
      'respaldo'
    ).slice(0, 200);
    const filename = buildBackupFilename({ id: backupId, name: resolvedName });
    const finalPath = buildBackupPath(backupsEnv, filename);

    try {
      await moveFile(opts.tmpPath, finalPath);
      const checksum = await fileSha256Hex(finalPath);

      const backup = await this.backupModel.create({
        _id: backupObjectId,
        name: resolvedName,
        description: opts.description?.trim() ?? '',
        status: 'AVAILABLE',
        size: opts.size,
        tablesCount: 0,
        recordsCount: 0,
        completedAt: new Date(),
        createdBy: opts.createdBy,
        filePath: finalPath,
        checksum,
        iv: header.ivHex,
        authTag: header.authTagHex,
        errorMessage: null,
      });

      return toBackupPublic(backup.toObject() as BackupDoc);
    } catch (error) {
      await deleteBackupFile(opts.tmpPath);
      await deleteBackupFile(finalPath);
      throw error;
    }
  }

  private async runBackupCreationJob(backupId: string): Promise<void> {
    let finalPath: string | null = null;
    try {
      const backup = await this.backupModel.findById(backupId).exec();
      if (!backup) return;

      const backupsEnv = loadBackupsEnv();
      await ensureBackupDirs(backupsEnv);

      const filename = buildBackupFilename({ id: backupId, name: backup.name });
      finalPath = buildBackupPath(backupsEnv, filename);

      const dumpArgs = ['--uri', env.MONGODB_URI, '--archive'];
      const includeBackupsCollection = await this.canIncludeBackupsCollection(
        backupId
      );
      if (!includeBackupsCollection) {
        dumpArgs.push('--excludeCollection', 'backups');
      }

      const dumpProcess = spawn('mongodump', dumpArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (!dumpProcess.stdout) {
        throw new AppError(
          500,
          'BACKUP_FAILED',
          'No se pudo iniciar stream de mongodump'
        );
      }

      const gzip = createGzip();
      dumpProcess.stdout.pipe(gzip);

      const [{ ivHex, authTagHex, sizeBytes }] = await Promise.all([
        encryptStreamToFile({
          source: gzip,
          destPath: finalPath,
          key: backupsEnv.key,
        }),
        waitForProcess(dumpProcess, 'BACKUP_FAILED', 'Falló mongodump'),
      ]);

      const checksum = await fileSha256Hex(finalPath);
      const stats = await getDatabaseStatsSafe();

      backup.status = 'AVAILABLE';
      backup.size = sizeBytes;
      backup.tablesCount = stats.tablesCount;
      backup.recordsCount = stats.recordsCount;
      backup.completedAt = new Date();
      backup.filePath = finalPath;
      backup.checksum = checksum;
      backup.iv = ivHex;
      backup.authTag = authTagHex;
      backup.errorMessage = null;
      await backup.save();
    } catch (error) {
      if (finalPath) {
        await deleteBackupFile(finalPath);
      }
      await this.backupModel.findByIdAndUpdate(backupId, {
        status: 'FAILED',
        completedAt: new Date(),
        filePath: null,
        checksum: null,
        iv: null,
        authTag: null,
        errorMessage: toErrorMessage(error),
      });
    }
  }

  private async canIncludeBackupsCollection(
    currentBackupId: string
  ): Promise<boolean> {
    const backups = await this.backupModel
      .find({ _id: { $ne: currentBackupId } })
      .select({ filePath: 1 })
      .lean()
      .exec();

    if (backups.length === 0) {
      return true;
    }

    const checks = await Promise.all(
      backups.map(async (backup) => {
        const backupFilePath =
          typeof backup.filePath === 'string' ? backup.filePath : null;
        if (!backupFilePath) {
          return false;
        }
        return backupFileExists(backupFilePath);
      })
    );

    return checks.every(Boolean);
  }
}

function toBackupPublic(doc: BackupDoc): BackupPublic {
  const backupId = doc._id?.toString() ?? doc.id;
  if (!backupId) {
    throw new AppError(
      500,
      'BACKUP_INVALID_DOCUMENT',
      'Documento de respaldo inválido: id faltante'
    );
  }

  return {
    id: backupId,
    name: doc.name,
    description: doc.description || null,
    status: doc.status,
    size: doc.size,
    tablesCount: doc.tablesCount,
    recordsCount: doc.recordsCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    completedAt: doc.completedAt?.toISOString() ?? null,
    createdBy: doc.createdBy,
    filePath: doc.filePath,
    checksum: doc.checksum,
  };
}

async function assertToolAvailable(command: string): Promise<void> {
  try {
    const process = spawn(command, ['--version'], {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    await waitForProcess(
      process,
      'BACKUP_TOOL_UNAVAILABLE',
      `Herramienta no disponible: ${command}`,
      503
    );
  } catch (error) {
    if (error instanceof AppError && error.code === 'BACKUP_TOOL_UNAVAILABLE') {
      throw error;
    }
    throw new AppError(
      503,
      'BACKUP_TOOL_UNAVAILABLE',
      `Herramienta no disponible: ${command}`
    );
  }
}

async function waitForProcess(
  child: ReturnType<typeof spawn>,
  code: string,
  message: string,
  statusCode = 500
): Promise<void> {
  let stderr = '';
  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
  }

  await new Promise<void>((resolve, reject) => {
    child.once('error', (error) => {
      reject(new AppError(statusCode, code, message, { cause: error.message }));
    });
    child.once('close', (exitCode) => {
      if (exitCode === 0) {
        resolve();
        return;
      }
      reject(
        new AppError(statusCode, code, message, {
          exitCode,
          stderr: stderr.trim() || undefined,
        })
      );
    });
  });
}

async function getDatabaseStatsSafe(): Promise<{
  tablesCount: number;
  recordsCount: number;
}> {
  try {
    const db = mongoose.connection.db;
    if (!db) return { tablesCount: 0, recordsCount: 0 };

    const [collections, dbStats] = await Promise.all([
      db.listCollections().toArray(),
      db.stats(),
    ]);
    return {
      tablesCount: collections.length,
      recordsCount: typeof dbStats.objects === 'number' ? dbStats.objects : 0,
    };
  } catch {
    return { tablesCount: 0, recordsCount: 0 };
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido al crear respaldo';
}
