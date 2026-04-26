import { Router } from 'express';
import type { GraduationsController } from './graduations.controller.js';

export interface GraduationsRouterDeps {
  getGraduationsController: () => GraduationsController;
}

/**
 * Register `/:studentId/graduate` and `/:studentId/ungraduate` before static
 * `/student/:id` routes to avoid any accidental shadowing in future edits.
 */
export function createGraduationsRouter(deps: GraduationsRouterDeps): Router {
  const router = Router();
  const getController = deps.getGraduationsController;

  router.post('/:studentId/graduate', (req, res, next) =>
    getController().handleGraduate(req, res, next)
  );
  router.post('/:studentId/ungraduate', (req, res, next) =>
    getController().handleUngraduate(req, res, next)
  );

  router.get('/student/:id', (req, res, next) =>
    getController().handleGetByStudentId(req, res, next)
  );
  router.post('/', (req, res, next) =>
    getController().handleCreate(req, res, next)
  );
  router.put('/student/:id', (req, res, next) =>
    getController().handlePut(req, res, next)
  );
  router.patch('/student/:id', (req, res, next) =>
    getController().handlePatch(req, res, next)
  );
  router.delete('/student/:id', (req, res, next) =>
    getController().handleDelete(req, res, next)
  );

  return router;
}
