import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { UsersController } from './users.controller.js';

export interface UsersRouterDeps {
  getUsersController: () => UsersController;
  /** Middleware: only ADMIN. Use for list, create, update, delete, activate, deactivate, change-password admin */
  requireAdmin: RequestHandler;
  /** Middleware: ADMIN or self (params.id === userId). Use for GET /:id */
  requireAdminOrSelf: RequestHandler;
}

/**
 * Creates the users router with handlers resolved from the DI container.
 * Requires requireAdmin and requireAdminOrSelf from the app (e.g. from @backend/auth).
 */
export function createUsersRouter(deps: UsersRouterDeps): Router {
  const router = Router();
  const getController = deps.getUsersController;
  const { requireAdmin, requireAdminOrSelf } = deps;

  router.get('/', requireAdmin, (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.get('/:id', requireAdminOrSelf, (req, res, next) =>
    getController().handleGetById(req, res, next)
  );
  router.post('/', requireAdmin, (req, res, next) =>
    getController().handleCreate(req, res, next)
  );

  router.patch('/me', (req, res, next) =>
    getController().handlePatchMe(req, res, next)
  );
  router.post('/me/change-password', (req, res, next) =>
    getController().handleChangePasswordMe(req, res, next)
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
  router.post('/:id/change-password', requireAdmin, (req, res, next) =>
    getController().handleChangePasswordAdmin(req, res, next)
  );

  return router;
}
