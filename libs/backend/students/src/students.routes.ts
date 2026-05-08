import { Router } from 'express';
import type { StudentsController } from './students.controller.js';

export interface StudentsRouterDeps {
  getStudentsController: () => StudentsController;
}

export function createStudentsRouter(deps: StudentsRouterDeps): Router {
  const router = Router();
  const getController = deps.getStudentsController;

  // Static routes before /:id to avoid param capture
  router.get('/', (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.get('/in-progress', (req, res, next) =>
    getController().handleListInProgress(req, res, next)
  );
  router.get('/scheduled', (req, res, next) =>
    getController().handleListScheduled(req, res, next)
  );
  router.get('/graduated', (req, res, next) =>
    getController().handleListGraduated(req, res, next)
  );

  router.get('/:id', (req, res, next) =>
    getController().handleGetById(req, res, next)
  );
  router.post('/', (req, res, next) =>
    getController().handleCreate(req, res, next)
  );
  router.put('/:id', (req, res, next) =>
    getController().handleUpdate(req, res, next)
  );
  router.patch('/:id', (req, res, next) =>
    getController().handlePatch(req, res, next)
  );
  router.delete('/:id', (req, res, next) =>
    getController().handleDelete(req, res, next)
  );
  router.post('/:id/status', (req, res, next) =>
    getController().handleChangeStatus(req, res, next)
  );
  router.post('/:id/egress', (req, res, next) =>
    getController().handleEgress(req, res, next)
  );
  router.post('/:id/unegress', (req, res, next) =>
    getController().handleUnegress(req, res, next)
  );
  router.post('/:id/process-status', (req, res, next) =>
    getController().handleProcessStatus(req, res, next)
  );

  return router;
}
