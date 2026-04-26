import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

interface DashboardControllerLike {
  handleGet: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

export interface DashboardRouterDeps {
  getDashboardController: () => DashboardControllerLike;
}

export function createDashboardRouter(deps: DashboardRouterDeps): Router {
  const router = Router();
  const getController = deps.getDashboardController;

  router.get('/', (req, res, next) =>
    getController().handleGet(req, res, next)
  );

  return router;
}
