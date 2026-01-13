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
  currentPassword?: string; // Opcional para admin, requerido para usuario propio
  newPassword: string;
}

interface PaginationData {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface ListResponse {
  data: User[];
  pagination: PaginationData;
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
function canManageUser(
  authenticatedUser: User | null,
  targetUserId: string
): boolean {
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

/**
 * Valida que el username sea alfanumérico y sin espacios
 * @param username - Nombre de usuario a validar
 * @returns true si es válido, false en caso contrario
 */
function isValidUsernameFormat(username: string): boolean {
  // Solo permite caracteres alfanuméricos (letras y números)
  // Sin espacios
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(username);
}

/**
 * Valida que la contraseña cumpla con los requisitos estrictos:
 * - Mínimo 8 caracteres
 * - Al menos un número
 * - Al menos una letra minúscula
 * - Al menos una letra mayúscula
 * - Al menos un símbolo
 * @param password - Contraseña a validar
 * @returns true si es válida, false en caso contrario
 */
function isValidPasswordFormat(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  // Verificar que tenga al menos un número
  if (!/\d/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos un símbolo (carácter especial)
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * Excluye el campo avatar de un objeto User
 * El avatar solo debe ser visible/actualizable por el usuario propietario en PATCH /users/me
 */
function excludeAvatar(user: User): Omit<User, 'avatar'> & { avatar?: never } {
  const { avatar, ...userWithoutAvatar } = user;
  return userWithoutAvatar;
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
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const activeOnly = url.searchParams.get('activeOnly') === 'true';
    const roleParam = url.searchParams.get('role');
    const role =
      roleParam === UserRole.ADMIN || roleParam === UserRole.STAFF
        ? roleParam
        : undefined;
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';

    const validSortFields = [
      'username',
      'email',
      'role',
      'createdAt',
      'lastLogin',
      'isActive',
    ];
    const requestedSortBy = url.searchParams.get('sortBy') || 'username';
    const sortBy = validSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : 'username';

    const requestedSortOrder = url.searchParams.get('sortOrder') || 'asc';
    const sortOrder =
      requestedSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = activeOnly
      ? mockUsers.filter((user: User) => user.isActive)
      : [...mockUsers];

    // Filtrar por rol si se proporciona
    if (role) {
      filteredData = filteredData.filter((user: User) => user.role === role);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredData = filteredData.filter((user: User) => {
        const usernameMatch =
          user.username?.toLowerCase().includes(searchLower) ?? false;
        const emailMatch =
          user.email?.toLowerCase().includes(searchLower) ?? false;
        return usernameMatch || emailMatch;
      });
    }

    filteredData.sort((a, b) => {
      let aValue: string | number | boolean | Date | null;
      let bValue: string | number | boolean | Date | null;

      switch (sortBy) {
        case 'username':
          aValue = a.username?.toLowerCase() ?? '';
          bValue = b.username?.toLowerCase() ?? '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() ?? '';
          bValue = b.email?.toLowerCase() ?? '';
          break;
        case 'role':
          aValue = a.role?.toLowerCase() ?? '';
          bValue = b.role?.toLowerCase() ?? '';
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'lastLogin':
          aValue = a.lastLogin;
          bValue = b.lastLogin;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.username?.toLowerCase() ?? '';
          bValue = b.username?.toLowerCase() ?? '';
      }

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedData = filteredData.slice(offset, offset + limit);

    const pagingCounter = total > 0 ? offset + 1 : 0;
    const currentPage = Math.min(page, totalPages);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const response: ListResponse = {
      data: paginatedData.map((user) => ({
        ...user,
        lastLogin: user.lastLogin?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })) as unknown as User[],
      pagination: {
        total,
        limit,
        totalPages,
        page: currentPage,
        pagingCounter,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? currentPage - 1 : null,
        nextPage: hasNextPage ? currentPage + 1 : null,
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
      ...excludeAvatar(targetUser),
      lastLogin: targetUser.lastLogin?.toISOString() ?? null,
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

    // Validar formato del username: alfanumérico y sin espacios
    if (!isValidUsernameFormat(body.username.trim())) {
      return HttpResponse.json(
        {
          error:
            'El nombre de usuario debe contener solo letras y números, sin espacios',
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

    if (!body.password) {
      return HttpResponse.json(
        {
          error: 'La contraseña es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar formato de contraseña: mínimo 8 caracteres, números, mayúsculas, minúsculas y símbolos
    if (!isValidPasswordFormat(body.password)) {
      return HttpResponse.json(
        {
          error:
            'La contraseña debe tener al menos 8 caracteres, incluyendo números, letras mayúsculas, letras minúsculas y símbolos',
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
      lastLogin: null, // Se actualiza automáticamente cuando el usuario se loguea
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);
    // Guardar la contraseña en el mapa
    setUserPassword(newUserId, body.password);

    return HttpResponse.json(
      {
        ...excludeAvatar(newUser),
        lastLogin: newUser.lastLogin?.toISOString() ?? null,
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

    // Validar formato del username si se proporciona: alfanumérico y sin espacios
    if (body.username && !isValidUsernameFormat(body.username.trim())) {
      return HttpResponse.json(
        {
          error:
            'El nombre de usuario debe contener solo letras y números, sin espacios',
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
      ...excludeAvatar(targetUser),
      lastLogin: targetUser.lastLogin?.toISOString() ?? null,
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // PATCH /users/me (Update own profile) - Usuario autenticado
  // IMPORTANTE: Este handler debe estar ANTES de /users/:id para evitar que :id capture "me"
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

    // Validar formato del username si se proporciona: alfanumérico y sin espacios
    if (body.username && !isValidUsernameFormat(body.username.trim())) {
      return HttpResponse.json(
        {
          error:
            'El nombre de usuario debe contener solo letras y números, sin espacios',
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
      lastLogin: authenticatedUser.lastLogin?.toISOString() ?? null,
      createdAt: authenticatedUser.createdAt.toISOString(),
      updatedAt: authenticatedUser.updatedAt.toISOString(),
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

    // Validar formato del username si se proporciona: alfanumérico y sin espacios
    if (body.username && !isValidUsernameFormat(body.username.trim())) {
      return HttpResponse.json(
        {
          error:
            'El nombre de usuario debe contener solo letras y números, sin espacios',
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
      ...excludeAvatar(targetUser),
      lastLogin: targetUser.lastLogin?.toISOString() ?? null,
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
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
      ...excludeAvatar(targetUser),
      lastLogin: targetUser.lastLogin?.toISOString() ?? null,
      createdAt: targetUser.createdAt.toISOString(),
      updatedAt: targetUser.updatedAt.toISOString(),
    });
  }),

  // POST /users/:id/deactivate
  http.post(
    buildApiUrl('/users/:id/deactivate'),
    async ({ params, request }) => {
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
        ...excludeAvatar(targetUser),
        lastLogin: targetUser.lastLogin?.toISOString() ?? null,
        createdAt: targetUser.createdAt.toISOString(),
        updatedAt: targetUser.updatedAt.toISOString(),
      });
    }
  ),

  // POST /users/me/change-password (Change own password) - Usuario autenticado
  // IMPORTANTE: Este handler debe estar ANTES de /users/:id/change-password para evitar que :id capture "me"
  http.post(buildApiUrl('/users/me/change-password'), async ({ request }) => {
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

    const body = (await request.json()) as ChangePasswordRequest;

    // Validaciones
    if (!body.newPassword) {
      return HttpResponse.json(
        {
          error: 'La nueva contraseña es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Requiere la contraseña actual
    if (!body.currentPassword) {
      return HttpResponse.json(
        {
          error: 'La contraseña actual es requerida',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar contraseña actual
    if (!validateUserPassword(authenticatedUser.id, body.currentPassword)) {
      return HttpResponse.json(
        {
          error: 'La contraseña actual es incorrecta',
          code: 'INVALID_PASSWORD',
        },
        { status: 400 }
      );
    }

    // Validar formato de contraseña: mínimo 8 caracteres, números, mayúsculas, minúsculas y símbolos
    if (!isValidPasswordFormat(body.newPassword)) {
      return HttpResponse.json(
        {
          error:
            'La nueva contraseña debe tener al menos 8 caracteres, incluyendo números, letras mayúsculas, letras minúsculas y símbolos',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (body.currentPassword === body.newPassword) {
      return HttpResponse.json(
        {
          error:
            'La nueva contraseña debe ser diferente a la contraseña actual',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Actualizar contraseña
    setUserPassword(authenticatedUser.id, body.newPassword);
    authenticatedUser.updatedAt = new Date();

    return HttpResponse.json({
      message: 'Contraseña actualizada exitosamente',
    });
  }),

  // POST /users/:id/change-password (Change password)
  http.post(
    buildApiUrl('/users/:id/change-password'),
    async ({ params, request }) => {
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

      // Este endpoint es exclusivo para administradores
      // Los usuarios no-admin deben usar /users/me/change-password
      if (authenticatedUser.role !== UserRole.ADMIN) {
        return HttpResponse.json(
          {
            error:
              'No tienes permisos para usar este endpoint. Por favor usa la opción de cambio de contraseña en tu perfil.',
            code: 'FORBIDDEN',
          },
          { status: 403 }
        );
      }

      // Restricción: Los administradores no pueden cambiar su propia contraseña desde este endpoint
      // Deben usar /users/me/change-password
      const isOwnPassword = authenticatedUser.id === targetUserId;
      if (isOwnPassword) {
        return HttpResponse.json(
          {
            error:
              'No puedes cambiar tu propia contraseña desde este endpoint. Por favor usa la opción de cambio de contraseña en tu perfil.',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      const body = (await request.json()) as ChangePasswordRequest;

      // Validaciones
      if (!body.newPassword) {
        return HttpResponse.json(
          {
            error: 'La nueva contraseña es requerida',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Los administradores no requieren currentPassword cuando cambian la contraseña de otro usuario
      // (isOwnPassword ya está validado arriba y retorna error, así que nunca llegamos aquí si es propia contraseña)

      // Validar formato de contraseña: mínimo 8 caracteres, números, mayúsculas, minúsculas y símbolos
      if (!isValidPasswordFormat(body.newPassword)) {
        return HttpResponse.json(
          {
            error:
              'La nueva contraseña debe tener al menos 8 caracteres, incluyendo números, letras mayúsculas, letras minúsculas y símbolos',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // No validamos que la nueva contraseña sea diferente a la actual porque
      // los administradores no proporcionan currentPassword cuando cambian la contraseña de otro usuario

      // Actualizar contraseña
      setUserPassword(targetUserId, body.newPassword);
      targetUser.updatedAt = new Date();

      return HttpResponse.json({
        message: 'Contraseña actualizada exitosamente',
      });
    }
  ),
];
