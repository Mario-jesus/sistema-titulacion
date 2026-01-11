import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/types';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
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

interface AppState extends BaseAppState {
  user: UserSliceState;
  auth: AuthSliceState;
}

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: AppState) => state.user.currentUser);
  const isAuthenticated = useSelector(
    (state: AppState) => state.user.isAuthenticated
  );

  const isLoading = useSelector((state: AppState) => state.auth.isLoading);
  const error = useSelector((state: AppState) => state.auth.error);
  const isCheckingAuth = useSelector(
    (state: AppState) => state.auth.isCheckingAuth
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<Result<User>> => {
      const result = await dispatch(loginThunk(credentials));

      if (loginThunk.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      } else {
        return {
          success: false,
          error: result.payload || 'Error al iniciar sesión',
          code: extractErrorCode(result.payload),
        };
      }
    },
    [dispatch]
  );

  const logout = useCallback(async (): Promise<Result<void>> => {
    const result = await dispatch(logoutThunk());

    if (logoutThunk.rejected.match(result)) {
      console.warn('Error al notificar logout al servidor:', result.payload);
      return {
        success: false,
        error: result.payload || 'Error al cerrar sesión',
        code: extractErrorCode(result.payload),
      };
    }

    return {
      success: true,
      data: undefined,
    };
  }, [dispatch]);

  const checkAuth = useCallback(async (): Promise<Result<User>> => {
    const result = await dispatch(checkAuthThunk());

    if (checkAuthThunk.fulfilled.match(result)) {
      return {
        success: true,
        data: result.payload,
      };
    } else {
      return {
        success: false,
        error: result.payload || 'No hay sesión activa',
        code: extractErrorCode(result.payload),
      };
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
