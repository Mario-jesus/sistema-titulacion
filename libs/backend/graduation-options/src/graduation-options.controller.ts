import type { NextFunction, Request, Response } from 'express';
import {
  createGraduationOptionSchema,
  updateGraduationOptionSchema,
} from './schemas/graduation-options.schemas.js';
import type { GraduationOptionsService } from './graduation-options.service.js';

export class GraduationOptionsController {
  constructor(
    private readonly graduationOptionsService: GraduationOptionsService
  ) {}

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        activeOnly: query.activeOnly === 'true',
        search: query.search || query.q,
        sortBy: query.sortBy || 'name',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.graduationOptionsService.listGraduationOptions(
        params,
        query
      );
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
      const option =
        await this.graduationOptionsService.getGraduationOptionById(
          req.params.id
        );
      if (!option) {
        res.status(404).json({
          error: 'Opción de titulación no encontrada',
          code: 'GRADUATION_OPTION_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(option);
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
      const parsed = createGraduationOptionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const option = await this.graduationOptionsService.createGraduationOption(
        parsed.data
      );
      res.status(201).json(option);
    } catch (err) {
      next(err);
    }
  };

  handleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateGraduationOptionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const option = await this.graduationOptionsService.updateGraduationOption(
        req.params.id,
        parsed.data
      );
      res.status(200).json(option);
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
      const parsed = updateGraduationOptionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const option = await this.graduationOptionsService.updateGraduationOption(
        req.params.id,
        parsed.data
      );
      res.status(200).json(option);
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
      await this.graduationOptionsService.deleteGraduationOption(req.params.id);
      res.status(200).json({
        message: 'Opción de titulación eliminada exitosamente',
      });
    } catch (err) {
      next(err);
    }
  };

  handleActivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const option =
        await this.graduationOptionsService.activateGraduationOption(
          req.params.id
        );
      res.status(200).json(option);
    } catch (err) {
      next(err);
    }
  };

  handleDeactivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const option =
        await this.graduationOptionsService.deactivateGraduationOption(
          req.params.id
        );
      res.status(200).json(option);
    } catch (err) {
      next(err);
    }
  };
}
