import type { NextFunction, Request, Response } from 'express';
import {
  createGraduationSchema,
  updateGraduationSchema,
} from './schemas/graduations.schemas.js';
import type { GraduationsService } from './graduations.service.js';

export class GraduationsController {
  constructor(private readonly graduationsService: GraduationsService) {}

  handleGetByStudentId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.graduationsService.getByStudentId(req.params.id);
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
      const parsed = createGraduationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.graduationsService.create(parsed.data);
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
      const parsed = updateGraduationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.graduationsService.updatePut(
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
      const parsed = updateGraduationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.graduationsService.updatePatch(
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
      await this.graduationsService.deleteByStudentId(req.params.id);
      res.status(200).json({
        message: 'Titulación eliminada exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };

  handleGraduate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.graduationsService.graduate(req.params.studentId);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  handleUngraduate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.graduationsService.ungraduate(
        req.params.studentId
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };
}
