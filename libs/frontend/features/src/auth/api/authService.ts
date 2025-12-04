import type { User } from '@entities/user';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type { LoginCredentials, LoginResponse, RefreshTokenResponse } from '../model/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      logger.log('Iniciando sesión...', { email: credentials.email });

      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Guardar el token en localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      logger.log('Sesión iniciada exitosamente', { userId: response.user.id });

      return response;
    } catch (error) {
      logger.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      logger.log('Cerrando sesión...');

      // Notificar al servidor
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        logger.warn('Error al notificar logout al servidor:', error);
      }

      // Limpiar tokens del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      logger.log('Sesión cerrada exitosamente');
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      logger.log('Refrescando token...');

      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      // Actualizar tokens en localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      logger.log('Token refrescado exitosamente');

      return response;
    } catch (error) {
      logger.error('Error al refrescar token:', error);

      // Si falla el refresh, limpiar tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      logger.log('Obteniendo usuario actual...');

      const user = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);

      logger.log('Usuario obtenido exitosamente', { userId: user.id });

      return user;
    } catch (error) {
      logger.error('Error al obtener usuario actual:', error);
      throw error;
    }
  },

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
};
