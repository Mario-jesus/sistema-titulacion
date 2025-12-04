import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from '@entities/user';
import type { LoginCredentials } from '../model/types';
import { loginThunk, logoutThunk, checkAuthThunk } from '../model/authThunks';

interface AuthSliceState {
  isLoading: boolean;
  error: string | null;
  isCheckingAuth: boolean;
}

interface UserSliceState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

interface AppState {
  user: UserSliceState;
  auth: AuthSliceState;
}

type AppDispatch = any;

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: AppState) => state.user.currentUser);
  const isAuthenticated = useSelector((state: AppState) => state.user.isAuthenticated);

  const isLoading = useSelector((state: AppState) => state.auth.isLoading);
  const error = useSelector((state: AppState) => state.auth.error);
  const isCheckingAuth = useSelector((state: AppState) => state.auth.isCheckingAuth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await dispatch(loginThunk(credentials));

    if (loginThunk.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.payload || 'Error al iniciar sesión');
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    const result = await dispatch(logoutThunk());

    if (logoutThunk.rejected.match(result)) {
      console.warn('Error al notificar logout al servidor:', result.payload);
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const result = await dispatch(checkAuthThunk());

    if (checkAuthThunk.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.payload || 'No hay sesión activa');
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isCheckingAuth,

    login,
    logout,
    checkAuth,
  };
}
