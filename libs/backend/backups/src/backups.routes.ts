import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { BackupsController } from './backups.controller.js';

export interface BackupsRouterDeps {
  getBackupsController: () => BackupsController;
  /**
   * Optional multer middleware injected at composition time (SA-05/SA-06).
   * Should handle a single-file field named e.g. `file` and place the parsed
   * upload on `req.file` for the controller's `handleUpload`.
   */
  uploadMiddleware?: RequestHandler;
}

export function createBackupsRouter(deps: BackupsRouterDeps): Router {
  const router = Router();
  const getController = deps.getBackupsController;
  const { uploadMiddleware } = deps;

  // Static routes before /:id to avoid param capture
  router.get('/', (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.post('/', (req, res, next) =>
    getController().handleCreate(req, res, next)
  );

  // multer middleware injected at composition time
  if (uploadMiddleware) {
    router.post('/upload', uploadMiddleware, (req, res, next) =>
      getController().handleUpload(req, res, next)
    );
  } else {
    router.post('/upload', (req, res, next) =>
      getController().handleUpload(req, res, next)
    );
  }

  router.get('/:id', (req, res, next) =>
    getController().handleGetById(req, res, next)
  );
  router.delete('/:id', (req, res, next) =>
    getController().handleDelete(req, res, next)
  );
  router.get('/:id/download', (req, res, next) =>
    getController().handleDownload(req, res, next)
  );
  router.post('/:id/restore', (req, res, next) =>
    getController().handleRestore(req, res, next)
  );

  return router;
}
