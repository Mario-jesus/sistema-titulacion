import { Router } from 'express';
import type { CapturedFieldsController } from './captured-fields.controller.js';

export interface CapturedFieldsRouterDeps {
  getCapturedFieldsController: () => CapturedFieldsController;
}

export function createCapturedFieldsRouter(
  deps: CapturedFieldsRouterDeps
): Router {
  const router = Router();
  const getController = deps.getCapturedFieldsController;

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
