import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@shared/api';
import {
  buildApiUrl,
  delay,
  generateToken,
  generateRefreshToken,
  extractUserIdFromToken,
  extractUserIdFromRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  invalidateRefreshToken,
  TOKEN_EXPIRES_IN,
  checkRateLimit,
} from '../utils';
import { findUserByEmail, findUserById, validateUserPassword } from '../data';

/**
 * Handlers para endpoints de autenticación
 */

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken?: string;
}

export const authHandlers = [
  // POST /auth/login
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), async ({ request }) => {
    await delay();

    // Verificar rate limiting
    if (checkRateLimit(request, 'LOGIN')) {
      return HttpResponse.json(
        {
          error:
            'Demasiados intentos de inicio de sesión. Por favor intenta más tarde.',
          code: 'TOO_MANY_REQUESTS',
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as LoginRequest;

    // Validar que se proporcionó email y password
    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Buscar usuario por email
    const user = findUserByEmail(body.email);

    if (!user) {
      return HttpResponse.json(
        {
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Validar contraseña
    if (!validateUserPassword(user.id, body.password)) {
      return HttpResponse.json(
        {
          error: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Validar que la cuenta esté activa
    if (!user.isActive) {
      return HttpResponse.json(
        {
          error: 'Tu cuenta está desactivada. Contacta al administrador.',
          code: 'ACCOUNT_DISABLED',
        },
        { status: 403 }
      );
    }

    // Invalidar cualquier refresh token previo del usuario (logout previo)
    invalidateRefreshToken(user.id);

    // Actualizar lastLogin cuando el usuario se loguea
    user.lastLogin = new Date();
    user.updatedAt = new Date();

    // Generar nuevos tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Almacenar el nuevo refresh token (rotación)
    storeRefreshToken(user.id, refreshToken);

    const response = {
      user,
      token,
      refreshToken,
      expiresIn: TOKEN_EXPIRES_IN,
    };

    return HttpResponse.json(response);
  }),

  // POST /auth/refresh
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), async ({ request }) => {
    await delay();

    // Verificar rate limiting
    if (checkRateLimit(request, 'REFRESH')) {
      return HttpResponse.json(
        {
          error:
            'Demasiados intentos de refrescar token. Por favor intenta más tarde.',
          code: 'TOO_MANY_REQUESTS',
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as RefreshTokenRequest;

    // Validar que se proporcionó refreshToken
    if (!body.refreshToken) {
      return HttpResponse.json(
        {
          error: 'refreshToken es requerido',
          code: 'MISSING_REFRESH_TOKEN',
        },
        { status: 400 }
      );
    }

    // Extraer userId del refresh token
    const userId = extractUserIdFromRefreshToken(body.refreshToken);

    if (!userId) {
      return HttpResponse.json(
        {
          error: 'Refresh token inválido o expirado',
          code: 'INVALID_REFRESH_TOKEN',
        },
        { status: 401 }
      );
    }

    // Validar que el refresh token sea el último válido (rotación)
    if (!validateRefreshToken(userId, body.refreshToken)) {
      return HttpResponse.json(
        {
          error: 'Refresh token inválido o expirado',
          code: 'INVALID_REFRESH_TOKEN',
        },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = findUserById(userId);
    if (!user) {
      return HttpResponse.json(
        {
          error: 'Refresh token inválido o expirado',
          code: 'INVALID_REFRESH_TOKEN',
        },
        { status: 401 }
      );
    }

    // Validar que la cuenta esté activa
    if (!user.isActive) {
      return HttpResponse.json(
        {
          error: 'Tu cuenta está desactivada. Contacta al administrador.',
          code: 'ACCOUNT_DISABLED',
        },
        { status: 403 }
      );
    }

    // Invalidar el refresh token usado (rotación de tokens)
    invalidateRefreshToken(userId);

    // Generar nuevos tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Almacenar el nuevo refresh token
    storeRefreshToken(user.id, newRefreshToken);

    return HttpResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: TOKEN_EXPIRES_IN,
    });
  }),

  // GET /auth/me
  http.get(buildApiUrl(API_ENDPOINTS.AUTH.ME), async ({ request }) => {
    await delay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return HttpResponse.json(
        {
          error: 'No autenticado o token inválido',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return HttpResponse.json(
        {
          error: 'No autenticado o token inválido',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const user = findUserById(userId);
    if (!user) {
      return HttpResponse.json(
        {
          error: 'No autenticado o token inválido',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user,
    });
  }),

  // POST /auth/logout
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), async ({ request }) => {
    await delay();

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    // Intentar obtener userId del token
    let userId: string | null = null;
    if (token) {
      userId = extractUserIdFromToken(token);
    }

    // Si se proporciona refreshToken en el body, invalidarlo también
    try {
      const body = (await request.json()) as LogoutRequest;
      if (body.refreshToken) {
        const refreshTokenUserId = extractUserIdFromRefreshToken(
          body.refreshToken
        );
        if (refreshTokenUserId) {
          invalidateRefreshToken(refreshTokenUserId);
        }
      }
    } catch {
      // Si no hay body o está mal formado, continuar
    }

    // Invalidar el refresh token del usuario autenticado
    if (userId) {
      invalidateRefreshToken(userId);
    }

    // No requerimos autenticación para logout (puede fallar si el token ya expiró)
    return HttpResponse.json({
      message: 'Logout exitoso',
    });
  }),
];
