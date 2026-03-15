import { Router } from 'express';
import type { UsersController } from './users.controller.js';

export interface UsersRouterDeps {
  getUsersController: () => UsersController;
}

/**
 * Creates the users router with handlers resolved from the DI container.
 * Use this when wiring the app with Awilix (or any container) so the controller is injected.
 */
export function createUsersRouter(deps: UsersRouterDeps): Router {
  const router = Router();
  const getController = deps.getUsersController;

  router.get('/', (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.get('/:id', (req, res, next) =>
    getController().handleGetById(req, res, next)
  );
  router.post('/', (req, res, next) =>
    getController().handleCreate(req, res, next)
  );

  router.patch('/me', (req, res, next) =>
    getController().handlePatchMe(req, res, next)
  );
  router.post('/me/change-password', (req, res, next) =>
    getController().handleChangePasswordMe(req, res, next)
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
  router.post('/:id/activate', (req, res, next) =>
    getController().handleActivate(req, res, next)
  );
  router.post('/:id/deactivate', (req, res, next) =>
    getController().handleDeactivate(req, res, next)
  );
  router.post('/:id/change-password', (req, res, next) =>
    getController().handleChangePasswordAdmin(req, res, next)
  );

  return router;
}
