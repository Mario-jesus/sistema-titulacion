import type { NextFunction, Request, Response } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  patchMeSchema,
  changePasswordMeSchema,
  changePasswordAdminSchema,
} from './schemas/users.schemas.js';
import type { UsersService } from './users.service.js';

type ReqWithUserId = Request & { userId?: string };

function getCurrentUserId(req: Request): string | undefined {
  return (req as ReqWithUserId).userId;
}

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        activeOnly: query.activeOnly === 'true',
        role: query.role,
        search: query.search || query.q,
        sortBy: query.sortBy || 'username',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.usersService.listUsers(params, query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleGetById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.usersService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const user = await this.usersService.createUser(parsed.data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const user = await this.usersService.updateUser(
        req.params.id,
        parsed.data,
        getCurrentUserId(req)
      );
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handlePatchMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({
          error: 'No autenticado',
          code: 'UNAUTHORIZED',
        });
        return;
      }
      const parsed = patchMeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const user = await this.usersService.patchMe(userId, parsed.data);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handlePatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateUserSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const user = await this.usersService.updateUser(
        req.params.id,
        parsed.data,
        getCurrentUserId(req)
      );
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.usersService.deleteUser(req.params.id, getCurrentUserId(req));
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
      next(err);
    }
  };

  handleActivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.usersService.activateUser(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleDeactivate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.usersService.deactivateUser(
        req.params.id,
        getCurrentUserId(req)
      );
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleChangePasswordMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        res.status(401).json({
          error: 'No autenticado',
          code: 'UNAUTHORIZED',
        });
        return;
      }
      const parsed = changePasswordMeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      await this.usersService.changePasswordMe(userId, parsed.data);
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
      next(err);
    }
  };

  handleChangePasswordAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = changePasswordAdminSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      await this.usersService.changePasswordAdmin(
        req.params.id,
        parsed.data,
        getCurrentUserId(req)
      );
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (err) {
      next(err);
    }
  };
}
