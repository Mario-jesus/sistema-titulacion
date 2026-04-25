import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from '@backend/auth';
import type { RequestWithUserId } from '@backend/auth';
import { generateReportSchema } from './schemas/reports.schemas.js';
import type { ReportsService } from './reports.service.js';

export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly authService: AuthService
  ) {}

  handleGenerate = async (
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
      if (user.role === 'STAFF') {
        res.status(403).json({
          error: 'No tiene permisos para acceder a reportes',
          code: 'FORBIDDEN_REPORTS',
        });
        return;
      }

      const parsed = generateReportSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }

      if (
        parsed.data.reportType !== 'por-generaciones' &&
        parsed.data.reportType !== 'por-carreras'
      ) {
        res.status(400).json({
          error: 'Tipo de reporte no soportado',
          code: 'REPORT_TYPE_NOT_SUPPORTED',
        });
        return;
      }

      const result = await this.reportsService.generateReport(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
