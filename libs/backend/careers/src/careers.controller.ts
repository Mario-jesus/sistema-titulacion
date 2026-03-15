import type { NextFunction, Request, Response } from 'express';
import {
  createCareerSchema,
  updateCareerSchema,
} from './schemas/careers.schemas.js';
import type { CareersService } from './careers.service.js';

export class CareersController {
  constructor(private readonly careersService: CareersService) {}

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
      const result = await this.careersService.listCareers(params, query);
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
      const career = await this.careersService.getCareerById(req.params.id);
      if (!career) {
        res.status(404).json({
          error: 'Carrera no encontrada',
          code: 'CAREER_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(career);
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
      const parsed = createCareerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const career = await this.careersService.createCareer(parsed.data);
      res.status(201).json(career);
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
      const parsed = updateCareerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const career = await this.careersService.updateCareer(
        req.params.id,
        parsed.data
      );
      res.status(200).json(career);
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
      const parsed = updateCareerSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const career = await this.careersService.updateCareer(
        req.params.id,
        parsed.data
      );
      res.status(200).json(career);
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
      await this.careersService.deleteCareer(req.params.id);
      res.status(200).json({ message: 'Carrera eliminada exitosamente' });
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
      const career = await this.careersService.activateCareer(req.params.id);
      res.status(200).json(career);
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
      const career = await this.careersService.deactivateCareer(req.params.id);
      res.status(200).json(career);
    } catch (err) {
      next(err);
    }
  };
}
