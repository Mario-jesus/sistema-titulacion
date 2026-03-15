import type { NextFunction, Request, Response } from 'express';
import type { AuthService } from './auth.service.js';

export type RequestWithUserId = Request & { userId?: string };

/**
 * Middleware factory that validates the Bearer token and sets req.userId.
 * Use with a DI-resolved AuthService.
 */
export function createRequireAuth(getAuthService: () => AuthService) {
  return (req: RequestWithUserId, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No autenticado',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const token = authHeader.slice(7);
    const authService = getAuthService();
    const payload = authService.validateAccessToken(token);

    if (!payload) {
      res.status(401).json({
        error: 'Token inválido o expirado',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    req.userId = payload.userId;
    next();
  };
}

/**
 * Optional auth: sets req.userId if token is valid, but does not fail if missing/invalid.
 * Used for logout where we may have an expired token.
 */
export function createOptionalAuth(getAuthService: () => AuthService) {
  return (req: RequestWithUserId, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = getAuthService().validateAccessToken(token);
      if (payload) req.userId = payload.userId;
    }
    next();
  };
}

/**
 * Middleware factory that allows only requests from users whose role is in allowedRoles.
 * Must run after requireAuth (req.userId set).
 * Returns 403 FORBIDDEN if role is not allowed.
 */
export function createRequireRole(
  getAuthService: () => AuthService,
  allowedRoles: string[]
) {
  return async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        error: 'No autenticado',
        code: 'UNAUTHORIZED',
      });
      return;
    }
    try {
      const user = await getAuthService().getMe(userId);
      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          error: 'Sin permisos para esta acción',
          code: 'FORBIDDEN',
        });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware factory that allows requests if user's role is in allowedRoles OR req.params.id === req.userId.
 * Use for GET /users/:id so ADMIN can see anyone and STAFF can see only themselves.
 * Must run after requireAuth.
 */
export function createRequireRoleOrSelf(
  getAuthService: () => AuthService,
  allowedRoles: string[]
) {
  return async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        error: 'No autenticado',
        code: 'UNAUTHORIZED',
      });
      return;
    }
    const resourceId = req.params?.id;
    if (resourceId === userId) {
      next();
      return;
    }
    try {
      const user = await getAuthService().getMe(userId);
      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          error: 'Sin permisos para esta acción',
          code: 'FORBIDDEN',
        });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
