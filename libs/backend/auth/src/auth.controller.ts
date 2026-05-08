import type { NextFunction, Request, Response } from 'express';
import type { RequestWithUserId } from './require-auth.js';
import {
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './schemas/auth.schemas.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  handleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(401).json({
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }
      const result = await this.authService.login(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleRefresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'refreshToken es requerido',
          code: 'MISSING_REFRESH_TOKEN',
        });
        return;
      }
      const result = await this.authService.refresh(parsed.data);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as RequestWithUserId).userId;
      if (!userId) {
        res.status(401).json({
          error: 'No autenticado',
          code: 'UNAUTHORIZED',
        });
        return;
      }
      const user = await this.authService.getMe(userId);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };

  handleLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as RequestWithUserId).userId;
      const parsed = logoutSchema.safeParse(req.body);
      const refreshToken = parsed.success
        ? parsed.data.refreshToken
        : undefined;

      await this.authService.logout(userId, refreshToken);
      res.status(200).json({ message: 'Logout exitoso' });
    } catch (err) {
      next(err);
    }
  };
}
