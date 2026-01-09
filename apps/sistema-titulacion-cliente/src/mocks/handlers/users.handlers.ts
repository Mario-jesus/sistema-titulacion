import { http, HttpResponse } from 'msw';
import type { User } from '@entities/user/model';
import { UserRole } from '@entities/user/model';
import { buildApiUrl, delay, extractUserIdFromToken } from '../utils';
import {
  mockUsers,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  generateUserId,
  setUserPassword,
  validateUserPassword,
} from '../data';

/**
 * Handlers para endpoints de usuarios
 */

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  role: UserRole;
  isActive?: boolean;
}

interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface UpdateMeRequest {
  username?: string;
  email?: string;
  avatar?: string | null;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ListResponse {
  data: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

/**
 * Extrae el usuario autenticado del request
 */
function getAuthenticatedUser(request: Request): User | null {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  const userId = extractUserIdFromToken(token);
  if (!userId) {
    return null;
  }

  return findUserById(userId) || null;
}

/**
 * Verifica si el usuario tiene permisos para gestionar otro usuario
 * - Los administradores pueden gestionar cualquier usuario
 * - Los usuarios pueden gestionar su propio usuario
 */
function canManageUser(authenticatedUser: User | null, targetUserId: string): boolean {
  if (!authenticatedUser) {
    return false;
  }

  // Los administradores pueden gestionar cualquier usuario
  if (authenticatedUser.role === UserRole.ADMIN) {
    return true;
  }

  // Los usuarios pueden gestionar su propio usuario
  return authenticatedUser.id === targetUserId;
}

export const usersHandlers = [
  // GET /users (List)
  http.get(buildApiUrl('/users'), async ({ request }) => {
    await delay(300);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Solo administradores pueden ver la lista de usuarios
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para ver la lista de usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';

    let filteredData = activeOnly
      ? mockUsers.filter((user: User) => user.isActive)
      : [...mockUsers];

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredData.slice(offset, offset + limit);

    const response: ListResponse = {
      data: paginatedData.map((user) => ({
        ...user,
        lastLogin: user.lastLogin.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })) as unknown as User[],
      pagination: {
        total,
        limit,
        offset,
        totalPages,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /users/:id (Detail)
  http.get(buildApiUrl('/users/:id'), async ({ params, request }) => {
    await delay(200);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verificar permisos: admin o el propio usuario
    if (!canManageUser(authenticatedUser, id as string)) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para ver este usuario',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      ...targetUser,
      lastLogin: targetUser.lastLogin.toISOString(),
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // POST /users (Create)
  http.post(buildApiUrl('/users'), async ({ request }) => {
    await delay(500);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Solo administradores pueden crear usuarios
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para crear usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateUserRequest;

    // Validaciones básicas
    if (!body.username || body.username.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre de usuario es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.email || body.email.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El email es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 6) {
      return HttpResponse.json(
        {
          error: 'La contraseña es requerida y debe tener al menos 6 caracteres',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return HttpResponse.json(
        {
          error: 'El formato del email no es válido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Verificar duplicados de username
    if (findUserByUsername(body.username)) {
      return HttpResponse.json(
        {
          error: 'Ya existe un usuario con ese nombre de usuario',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    // Verificar duplicados de email
    if (findUserByEmail(body.email)) {
      return HttpResponse.json(
        {
          error: 'Ya existe un usuario con ese email',
          code: 'DUPLICATE_ERROR',
        },
        { status: 409 }
      );
    }

    const newUserId = generateUserId();
    const newUser: User = {
      id: newUserId,
      username: body.username.trim(),
      email: body.email.toLowerCase().trim(),
      avatar: body.avatar || null,
      role: body.role || UserRole.STAFF,
      isActive: body.isActive ?? true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);
    // Guardar la contraseña en el mapa
    setUserPassword(newUserId, body.password);

    return HttpResponse.json(
      {
        ...newUser,
        lastLogin: newUser.lastLogin.toISOString(),
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /users/:id (Update) - Solo administradores
  http.put(buildApiUrl('/users/:id'), async ({ params, request }) => {
    await delay(400);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Solo administradores pueden usar este endpoint
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para editar usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateUserRequest;

    // Validaciones
    if (body.username !== undefined && body.username.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre de usuario no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.email !== undefined && body.email.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El email no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar formato de email si se proporciona
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return HttpResponse.json(
          {
            error: 'El formato del email no es válido',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
    }

    // Verificar duplicados de username (excluyendo el usuario actual)
    if (body.username) {
      const existingUser = findUserByUsername(body.username);
      if (existingUser && existingUser.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese nombre de usuario',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados de email (excluyendo el usuario actual)
    if (body.email) {
      const existingUser = findUserByEmail(body.email);
      if (existingUser && existingUser.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese email',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar usuario (solo campos permitidos: username, email, role, isActive)
    Object.assign(targetUser, {
      ...(body.username && { username: body.username.trim() }),
      ...(body.email && { email: body.email.toLowerCase().trim() }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      updatedAt: new Date(),
    });

    return HttpResponse.json({
      ...targetUser,
      lastLogin: targetUser.lastLogin.toISOString(),
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // PATCH /users/:id (Partial Update) - Solo administradores
  http.patch(buildApiUrl('/users/:id'), async ({ params, request }) => {
    await delay(400);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Solo administradores pueden usar este endpoint
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para editar usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateUserRequest;

    // Validaciones
    if (body.username !== undefined && body.username.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre de usuario no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.email !== undefined && body.email.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El email no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar formato de email si se proporciona
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return HttpResponse.json(
          {
            error: 'El formato del email no es válido',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
    }

    // Verificar duplicados de username (excluyendo el usuario actual)
    if (body.username) {
      const existingUser = findUserByUsername(body.username);
      if (existingUser && existingUser.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese nombre de usuario',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados de email (excluyendo el usuario actual)
    if (body.email) {
      const existingUser = findUserByEmail(body.email);
      if (existingUser && existingUser.id !== id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese email',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar usuario (solo campos permitidos: username, email, role, isActive)
    Object.assign(targetUser, {
      ...(body.username && { username: body.username.trim() }),
      ...(body.email && { email: body.email.toLowerCase().trim() }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      updatedAt: new Date(),
    });

    return HttpResponse.json({
      ...targetUser,
      lastLogin: targetUser.lastLogin.toISOString(),
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // PATCH /users/me (Update own profile) - Usuario autenticado
  http.patch(buildApiUrl('/users/me'), async ({ request }) => {
    await delay(400);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateMeRequest;

    // Validaciones
    if (body.username !== undefined && body.username.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El nombre de usuario no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (body.email !== undefined && body.email.trim().length === 0) {
      return HttpResponse.json(
        {
          error: 'El email no puede estar vacío',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar formato de email si se proporciona
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return HttpResponse.json(
          {
            error: 'El formato del email no es válido',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }
    }

    // Verificar duplicados de username (excluyendo el usuario actual)
    if (body.username) {
      const existingUser = findUserByUsername(body.username);
      if (existingUser && existingUser.id !== authenticatedUser.id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese nombre de usuario',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Verificar duplicados de email (excluyendo el usuario actual)
    if (body.email) {
      const existingUser = findUserByEmail(body.email);
      if (existingUser && existingUser.id !== authenticatedUser.id) {
        return HttpResponse.json(
          {
            error: 'Ya existe un usuario con ese email',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      }
    }

    // Actualizar usuario (solo campos permitidos: username, email, avatar)
    Object.assign(authenticatedUser, {
      ...(body.username && { username: body.username.trim() }),
      ...(body.email && { email: body.email.toLowerCase().trim() }),
      ...(body.avatar !== undefined && { avatar: body.avatar }),
      updatedAt: new Date(),
    });

    return HttpResponse.json({
      ...authenticatedUser,
      lastLogin: authenticatedUser.lastLogin.toISOString(),
      createdAt: authenticatedUser.createdAt.toISOString(),
      updatedAt: authenticatedUser.updatedAt.toISOString(),
    });
  }),

  // DELETE /users/:id (Delete)
  http.delete(buildApiUrl('/users/:id'), async ({ params, request }) => {
    await delay(300);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Solo administradores pueden eliminar usuarios (y no pueden eliminarse a sí mismos)
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para eliminar usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // No permitir que un administrador se elimine a sí mismo
    if (authenticatedUser.id === id) {
      return HttpResponse.json(
        {
          error: 'No puedes eliminar tu propio usuario',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }

    return HttpResponse.json({
      message: 'Usuario eliminado exitosamente',
    });
  }),

  // POST /users/:id/activate
  http.post(buildApiUrl('/users/:id/activate'), async ({ params, request }) => {
    await delay(200);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Solo administradores pueden activar usuarios
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para activar usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    targetUser.isActive = true;
    targetUser.updatedAt = new Date();

    return HttpResponse.json({
      ...targetUser,
      lastLogin: targetUser.lastLogin.toISOString(),
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // POST /users/:id/deactivate
  http.post(buildApiUrl('/users/:id/deactivate'), async ({ params, request }) => {
    await delay(200);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const targetUser = findUserById(id as string);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Solo administradores pueden desactivar usuarios (y no pueden desactivarse a sí mismos)
    if (authenticatedUser.role !== UserRole.ADMIN) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para desactivar usuarios',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // No permitir que un administrador se desactive a sí mismo
    if (authenticatedUser.id === id) {
      return HttpResponse.json(
        {
          error: 'No puedes desactivar tu propio usuario',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    targetUser.isActive = false;
    targetUser.updatedAt = new Date();

    return HttpResponse.json({
      ...targetUser,
      lastLogin: targetUser.lastLogin.toISOString(),
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // POST /users/:id/change-password (Change password)
  http.post(buildApiUrl('/users/:id/change-password'), async ({ params, request }) => {
    await delay(300);

    const authenticatedUser = getAuthenticatedUser(request);
    if (!authenticatedUser) {
      return HttpResponse.json(
        {
          error: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const targetUserId = id as string;
    const targetUser = findUserById(targetUserId);

    if (!targetUser) {
      return HttpResponse.json(
        {
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Solo el usuario autenticado o un administrador pueden cambiar contraseñas
    const isOwnPassword = authenticatedUser.id === targetUserId;
    const isAdmin = authenticatedUser.role === UserRole.ADMIN;

    if (!isOwnPassword && !isAdmin) {
      return HttpResponse.json(
        {
          error: 'No tienes permisos para cambiar la contraseña de este usuario',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as ChangePasswordRequest;

    // Validaciones
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        {
          error: 'La contraseña actual y la nueva contraseña son requeridas',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Si el usuario está cambiando su propia contraseña, validar la contraseña actual
    if (isOwnPassword) {
      if (!validateUserPassword(targetUserId, body.currentPassword)) {
        return HttpResponse.json(
          {
            error: 'La contraseña actual es incorrecta',
            code: 'INVALID_PASSWORD',
          },
          { status: 400 }
        );
      }
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (body.newPassword.length < 6) {
      return HttpResponse.json(
        {
          error: 'La nueva contraseña debe tener al menos 6 caracteres',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (isOwnPassword && body.currentPassword === body.newPassword) {
      return HttpResponse.json(
        {
          error: 'La nueva contraseña debe ser diferente a la contraseña actual',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Actualizar contraseña
    setUserPassword(targetUserId, body.newPassword);
    targetUser.updatedAt = new Date();

    return HttpResponse.json({
      message: 'Contraseña actualizada exitosamente',
    });
  }),
];
