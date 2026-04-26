import type { NextFunction, Request, Response } from 'express';

interface DashboardServiceLike {
  getDashboard: () => Promise<unknown>;
}

export class DashboardController {
  constructor(private readonly dashboardService: DashboardServiceLike) {}

  handleGet = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.dashboardService.getDashboard();
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };
}
