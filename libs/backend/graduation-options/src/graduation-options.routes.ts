import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { GraduationOptionsController } from './graduation-options.controller.js';

export interface GraduationOptionsRouterDeps {
  getGraduationOptionsController: () => GraduationOptionsController;
  requireAdmin: RequestHandler;
}

export function createGraduationOptionsRouter(
  deps: GraduationOptionsRouterDeps
): Router {
  const router = Router();
  const getController = deps.getGraduationOptionsController;
  const { requireAdmin } = deps;

  router.get('/', (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.get('/:id', (req, res, next) =>
    getController().handleGetById(req, res, next)
  );
  router.post('/', requireAdmin, (req, res, next) =>
    getController().handleCreate(req, res, next)
  );
  router.put('/:id', requireAdmin, (req, res, next) =>
    getController().handleUpdate(req, res, next)
  );
  router.patch('/:id', requireAdmin, (req, res, next) =>
    getController().handlePatch(req, res, next)
  );
  router.delete('/:id', requireAdmin, (req, res, next) =>
    getController().handleDelete(req, res, next)
  );
  router.post('/:id/activate', requireAdmin, (req, res, next) =>
    getController().handleActivate(req, res, next)
  );
  router.post('/:id/deactivate', requireAdmin, (req, res, next) =>
    getController().handleDeactivate(req, res, next)
  );

  return router;
}
