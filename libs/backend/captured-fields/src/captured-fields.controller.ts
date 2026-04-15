import type { NextFunction, Request, Response } from 'express';
import {
  createCapturedFieldsSchema,
  updateCapturedFieldsSchema,
} from './schemas/captured-fields.schemas.js';
import type { CapturedFieldsService } from './captured-fields.service.js';

export class CapturedFieldsController {
  constructor(private readonly capturedFieldsService: CapturedFieldsService) {}

  handleGetByStudentId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.capturedFieldsService.getByStudentId(
        req.params.id
      );
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
      const parsed = createCapturedFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.capturedFieldsService.create(parsed.data);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  };

  handlePut = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateCapturedFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.capturedFieldsService.updatePut(
        req.params.id,
        parsed.data
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  handlePatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateCapturedFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.capturedFieldsService.updatePatch(
        req.params.id,
        parsed.data
      );
      res.status(200).json(data);
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
      await this.capturedFieldsService.deleteByStudentId(req.params.id);
      res.status(200).json({
        message: 'Campos capturados eliminados exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };
}
