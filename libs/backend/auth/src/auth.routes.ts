import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { AuthController } from './auth.controller.js';
import { createOptionalAuth, createRequireAuth } from './require-auth.js';
import type { AuthService } from './auth.service.js';

export interface AuthRouterDeps {
  getAuthController: () => AuthController;
  getAuthService: () => AuthService;
}

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Demasiados intentos', code: 'TOO_MANY_REQUESTS' },
  standardHeaders: true,
});

const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos', code: 'TOO_MANY_REQUESTS' },
  standardHeaders: true,
});

/**
 * Creates the auth router with handlers resolved from the DI container.
 * Login and refresh have rate limiting applied.
 */
export function createAuthRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const getController = deps.getAuthController;
  const requireAuth = createRequireAuth(deps.getAuthService);

  router.post('/login', loginRateLimit, (req, res, next) =>
    getController().handleLogin(req, res, next)
  );
  router.post('/refresh', refreshRateLimit, (req, res, next) =>
    getController().handleRefresh(req, res, next)
  );
  router.get('/me', requireAuth, (req, res, next) =>
    getController().handleMe(req, res, next)
  );
  router.post(
    '/logout',
    createOptionalAuth(deps.getAuthService),
    (req, res, next) => getController().handleLogout(req, res, next)
  );

  return router;
}
