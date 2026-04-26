import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

interface ReportsControllerLike {
  handleGenerate: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}

export interface ReportsRouterDeps {
  getReportsController: () => ReportsControllerLike;
}

export function createReportsRouter(deps: ReportsRouterDeps): Router {
  const router = Router();
  const getController = deps.getReportsController;

  router.post('/generate', (req, res, next) =>
    getController().handleGenerate(req, res, next)
  );

  return router;
}
