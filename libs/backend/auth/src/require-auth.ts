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
