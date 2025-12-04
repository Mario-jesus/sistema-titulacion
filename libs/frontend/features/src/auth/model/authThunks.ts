import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@entities/user';
import { logger } from '@shared/lib/logger';
import { authService } from '../api/authService';
import type { LoginCredentials } from './types';

export const loginThunk = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.user;
    } catch (error) {

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error desconocido al iniciar sesión');
    }
  }
);

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return;
    } catch (error) {

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error al cerrar sesión');
    }
  }
);

export const checkAuthThunk = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      if (!authService.hasToken()) {
        return rejectWithValue('No hay token de autenticación');
      }

      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      logger.warn('Error al verificar autenticación, limpiando tokens...');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error al verificar autenticación');
    }
  }
);

export const refreshTokenThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      await authService.refreshToken();
      return;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Error al refrescar token');
    }
  }
);
