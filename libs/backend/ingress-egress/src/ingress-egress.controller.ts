import type { NextFunction, Request, Response } from 'express';
import { listIngressEgressSchema } from './schemas/ingress-egress.schemas.js';
import type { IngressEgressService } from './ingress-egress.service.js';

export class IngressEgressController {
  constructor(private readonly ingressEgressService: IngressEgressService) {}

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = listIngressEgressSchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const data = await this.ingressEgressService.list(parsed.data);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  handleGetDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { generationId, careerId } = req.params;
      if (!generationId || !careerId) {
        res.status(400).json({
          error: 'GenerationId y CareerId son requeridos',
          code: 'VALIDATION_ERROR',
        });
        return;
      }
      const data = await this.ingressEgressService.getDetail(
        generationId,
        careerId
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };
}
