import { http, HttpResponse } from 'msw';
import type { LoginCredentials, LoginResponse } from '@features/auth';
import { API_ENDPOINTS } from '@shared/api';
import { buildApiUrl, delay, generateToken, extractUserIdFromToken, extractUserIdFromRefreshToken } from '../utils';
import { findUserByEmail, findUserById } from '../data';

/**
 * Handlers para endpoints de autenticación
 */
export const authHandlers = [
  // POST /auth/login
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as LoginCredentials;

    // Validar credenciales
    const user = findUserByEmail(body.email);

    if (!user || body.password !== 'password123') {
      return HttpResponse.json(
        {
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
          fieldErrors: {
            email: 'Email o contraseña incorrectos',
            password: 'Email o contraseña incorrectos',
          },
        },
        { status: 401 }
      );
    }

    const token = generateToken(user.id);
    const refreshToken = `refresh-${token}`;

    const response: LoginResponse = {
      user,
      token,
      refreshToken,
    };

    return HttpResponse.json(response);
  }),

  // POST /auth/logout
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Sesión cerrada exitosamente' });
  }),

  // GET /auth/me
  http.get(buildApiUrl(API_ENDPOINTS.AUTH.ME), async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return HttpResponse.json(
        { message: 'Token inválido o faltante' },
        { status: 401 }
      );
    }

    const user = findUserById(userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user);
  }),

  // POST /auth/refresh
  http.post(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as { refreshToken: string };

    const userId = extractUserIdFromRefreshToken(body.refreshToken || '');
    if (!userId) {
      return HttpResponse.json(
        { message: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    const user = findUserById(userId);
    if (!user) {
      return HttpResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = `refresh-${newToken}`;

    return HttpResponse.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  }),
];
