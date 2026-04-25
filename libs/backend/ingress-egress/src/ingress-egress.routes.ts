import { Router } from 'express';
import type { IngressEgressController } from './ingress-egress.controller.js';

export interface IngressEgressRouterDeps {
  getIngressEgressController: () => IngressEgressController;
}

export function createIngressEgressRouter(
  deps: IngressEgressRouterDeps
): Router {
  const router = Router();
  const getController = deps.getIngressEgressController;

  router.get('/', (req, res, next) =>
    getController().handleList(req, res, next)
  );
  router.get('/:generationId/:careerId', (req, res, next) =>
    getController().handleGetDetail(req, res, next)
  );

  return router;
}
