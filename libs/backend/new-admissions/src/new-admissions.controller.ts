import type { NextFunction, Request, Response } from 'express';
import {
  createNewAdmissionSchema,
  updateNewAdmissionSchema,
} from './schemas/new-admissions.schemas.js';
import type { NewAdmissionsService } from './new-admissions.service.js';

export class NewAdmissionsController {
  constructor(private readonly newAdmissionsService: NewAdmissionsService) {}

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
        careerId: query.careerId,
        generationId: query.generationId,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
      };
      const result = await this.newAdmissionsService.listNewAdmissions(
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
      const admission = await this.newAdmissionsService.getNewAdmissionById(
        req.params.id
      );
      if (!admission) {
        res.status(404).json({
          error: 'Registro de admisiones no encontrado',
          code: 'NEW_ADMISSION_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(admission);
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
      const parsed = createNewAdmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const admission = await this.newAdmissionsService.createNewAdmission(
        parsed.data
      );
      res.status(201).json(admission);
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
      const parsed = updateNewAdmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const admission = await this.newAdmissionsService.updateNewAdmission(
        req.params.id,
        parsed.data
      );
      res.status(200).json(admission);
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
      const parsed = updateNewAdmissionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const admission = await this.newAdmissionsService.patchNewAdmission(
        req.params.id,
        parsed.data
      );
      res.status(200).json(admission);
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
      await this.newAdmissionsService.deleteNewAdmission(req.params.id);
      res.status(200).json({
        message: 'Registro de admisiones eliminado exitosamente',
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
      const admission = await this.newAdmissionsService.activateNewAdmission(
        req.params.id
      );
      res.status(200).json(admission);
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
      const admission = await this.newAdmissionsService.deactivateNewAdmission(
        req.params.id
      );
      res.status(200).json(admission);
    } catch (err) {
      next(err);
    }
  };
}
