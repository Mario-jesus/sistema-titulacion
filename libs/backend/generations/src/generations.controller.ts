import type { NextFunction, Request, Response } from 'express';
import {
  createGenerationSchema,
  updateGenerationSchema,
} from './schemas/generations.schemas.js';
import type { GenerationsService } from './generations.service.js';

export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

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
        sortBy: query.sortBy || 'startYear',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
      };
      const result = await this.generationsService.listGenerations(
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
      const gen = await this.generationsService.getGenerationById(
        req.params.id
      );
      if (!gen) {
        res.status(404).json({
          error: 'Generación no encontrada',
          code: 'GENERATION_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(gen);
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
      const parsed = createGenerationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const gen = await this.generationsService.createGeneration(parsed.data);
      res.status(201).json(gen);
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
      const parsed = updateGenerationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const gen = await this.generationsService.updateGeneration(
        req.params.id,
        parsed.data
      );
      res.status(200).json(gen);
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
      const parsed = updateGenerationSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const gen = await this.generationsService.updateGeneration(
        req.params.id,
        parsed.data
      );
      res.status(200).json(gen);
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
      await this.generationsService.deleteGeneration(req.params.id);
      res.status(200).json({ message: 'Generación eliminada exitosamente' });
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
      const gen = await this.generationsService.activateGeneration(
        req.params.id
      );
      res.status(200).json(gen);
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
      const gen = await this.generationsService.deactivateGeneration(
        req.params.id
      );
      res.status(200).json(gen);
    } catch (err) {
      next(err);
    }
  };
}
