import type { NextFunction, Request, Response } from 'express';
import {
  createModalitySchema,
  updateModalitySchema,
} from './schemas/modalities.schemas.js';
import type { ModalitiesService } from './modalities.service.js';

export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

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
      const result = await this.modalitiesService.listModalities(params, query);
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
      const modality = await this.modalitiesService.getModalityById(
        req.params.id
      );
      if (!modality) {
        res.status(404).json({
          error: 'Modalidad no encontrada',
          code: 'MODALITY_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(modality);
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
      const parsed = createModalitySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const modality = await this.modalitiesService.createModality(parsed.data);
      res.status(201).json(modality);
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
      const parsed = updateModalitySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const modality = await this.modalitiesService.updateModality(
        req.params.id,
        parsed.data
      );
      res.status(200).json(modality);
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
      const parsed = updateModalitySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const modality = await this.modalitiesService.updateModality(
        req.params.id,
        parsed.data
      );
      res.status(200).json(modality);
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
      await this.modalitiesService.deleteModality(req.params.id);
      res.status(200).json({ message: 'Modalidad eliminada exitosamente' });
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
      const modality = await this.modalitiesService.activateModality(
        req.params.id
      );
      res.status(200).json(modality);
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
      const modality = await this.modalitiesService.deactivateModality(
        req.params.id
      );
      res.status(200).json(modality);
    } catch (err) {
      next(err);
    }
  };
}
