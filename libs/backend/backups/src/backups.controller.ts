import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '@backend/auth';
import type { RequestWithUserId } from '@backend/auth';
import {
  createBackupSchema,
  listBackupsQuerySchema,
  uploadBackupBodySchema,
} from './schemas/backups.schemas.js';
import type { BackupsService } from './backups.service.js';

export class BackupsController {
  constructor(
    private readonly backupsService: BackupsService,
    private readonly authService: AuthService
  ) {}

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = listBackupsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const result = await this.backupsService.listBackups(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleGetById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.backupsService.getBackupById(req.params.id);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as RequestWithUserId).userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado', code: 'UNAUTHORIZED' });
        return;
      }
      const user = await this.authService.getMe(userId);
      const parsed = createBackupSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.backupsService.createBackup(
        parsed.data,
        user.email
      );
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.backupsService.deleteBackup(req.params.id);
      res.status(200).json({ message: 'Respaldo eliminado exitosamente' });
    } catch (err) {
      next(err);
    }
  };

  handleDownload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { stream, filename, size } =
        await this.backupsService.getDownloadStream(req.params.id);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      if (size > 0) {
        res.setHeader('Content-Length', String(size));
      }
      stream.pipe(res);
      stream.on('error', (err) => next(err));
    } catch (err) {
      next(err);
    }
  };

  handleRestore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.backupsService.restoreBackup(req.params.id);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  handleUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as RequestWithUserId).userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado', code: 'UNAUTHORIZED' });
        return;
      }
      const user = await this.authService.getMe(userId);
      const parsed = uploadBackupBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const file = (
        req as Request & {
          file?: { path: string; originalname: string; size: number };
        }
      ).file;
      if (!file) {
        res.status(400).json({
          error: 'Archivo de respaldo requerido',
          code: 'NO_FILE_UPLOADED',
        });
        return;
      }
      const uploadedBackup = await this.backupsService.ingestUploadedBackup({
        tmpPath: file.path,
        originalName: file.originalname,
        size: file.size,
        name: parsed.data.name,
        description: parsed.data.description,
        createdBy: user.email,
      });
      await this.backupsService.restoreBackup(uploadedBackup.id);
      res
        .status(201)
        .json({
          message: 'Archivo de respaldo subido y restauración completada',
        });
    } catch (err) {
      next(err);
    }
  };
}
