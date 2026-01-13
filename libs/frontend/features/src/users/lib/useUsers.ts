import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { User } from '@entities/user/model';
import type {
  ListUsersParams,
  ListUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '../model/types';
import {
  listUsersThunk,
  getUserByIdThunk,
  createUserThunk,
  updateUserThunk,
  patchUserThunk,
  deleteUserThunk,
  activateUserThunk,
  deactivateUserThunk,
  changePasswordThunk,
  updateProfileThunk,
  changePasswordMeThunk,
} from '../model/usersThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearChangePasswordError,
  clearUpdateProfileError,
  clearChangePasswordMeError,
  clearCurrentUser,
  clearAllErrors,
  type UsersState,
} from '../model/usersSlice';

interface AppState extends BaseAppState {
  users: UsersState;
}

export function useUsers() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const users = useSelector((state: AppState) => state.users.users);
  const pagination = useSelector((state: AppState) => state.users.pagination);
  const currentUser = useSelector((state: AppState) => state.users.currentUser);

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.users.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.users.isLoadingDetail
  );
  const isCreating = useSelector((state: AppState) => state.users.isCreating);
  const isUpdating = useSelector((state: AppState) => state.users.isUpdating);
  const isDeleting = useSelector((state: AppState) => state.users.isDeleting);
  const isActivating = useSelector(
    (state: AppState) => state.users.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.users.isDeactivating
  );
  const isChangingPassword = useSelector(
    (state: AppState) => state.users.isChangingPassword
  );
  const isUpdatingProfile = useSelector(
    (state: AppState) => state.users.isUpdatingProfile
  );
  const isChangingPasswordMe = useSelector(
    (state: AppState) => state.users.isChangingPasswordMe
  );

  // Errores
  const listError = useSelector((state: AppState) => state.users.listError);
  const detailError = useSelector((state: AppState) => state.users.detailError);
  const createError = useSelector((state: AppState) => state.users.createError);
  const updateError = useSelector((state: AppState) => state.users.updateError);
  const deleteError = useSelector((state: AppState) => state.users.deleteError);
  const activateError = useSelector(
    (state: AppState) => state.users.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.users.deactivateError
  );
  const changePasswordError = useSelector(
    (state: AppState) => state.users.changePasswordError
  );
  const updateProfileError = useSelector(
    (state: AppState) => state.users.updateProfileError
  );
  const changePasswordMeError = useSelector(
    (state: AppState) => state.users.changePasswordMeError
  );

  // ========== ACTIONS ==========
  const listUsers = useCallback(
    async (params?: ListUsersParams): Promise<Result<ListUsersResponse>> => {
      const result = await dispatch(listUsersThunk(params));

      if (listUsersThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener lista de usuarios',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const getUserById = useCallback(
    async (id: string): Promise<Result<User>> => {
      const result = await dispatch(getUserByIdThunk(id));

      if (getUserByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const createUser = useCallback(
    async (data: CreateUserRequest): Promise<Result<User>> => {
      const result = await dispatch(createUserThunk(data));

      if (createUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserRequest): Promise<Result<User>> => {
      const result = await dispatch(updateUserThunk({ id, data }));

      if (updateUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const patchUser = useCallback(
    async (
      id: string,
      data: Partial<UpdateUserRequest>
    ): Promise<Result<User>> => {
      const result = await dispatch(patchUserThunk({ id, data }));

      if (patchUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteUserThunk(id));

      if (deleteUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const activateUser = useCallback(
    async (id: string): Promise<Result<User>> => {
      const result = await dispatch(activateUserThunk(id));

      if (activateUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al activar usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const deactivateUser = useCallback(
    async (id: string): Promise<Result<User>> => {
      const result = await dispatch(deactivateUserThunk(id));

      if (deactivateUserThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al desactivar usuario',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (
      id: string,
      data: ChangePasswordRequest
    ): Promise<Result<{ message: string }>> => {
      const result = await dispatch(changePasswordThunk({ id, data }));

      if (changePasswordThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al cambiar contraseña',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: { message: result.payload.message },
      };
    },
    [dispatch]
  );

  const updateProfile = useCallback(
    async (data: {
      username?: string;
      email?: string;
      avatar?: string | null;
    }): Promise<Result<User>> => {
      const result = await dispatch(updateProfileThunk(data));

      if (updateProfileThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar perfil',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const changePasswordMe = useCallback(
    async (
      data: ChangePasswordRequest
    ): Promise<Result<{ message: string }>> => {
      const result = await dispatch(changePasswordMeThunk(data));

      if (changePasswordMeThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al cambiar contraseña',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: { message: result.payload.message },
      };
    },
    [dispatch]
  );

  // ========== CLEAR ACTIONS ==========
  const clearErrors = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  const clearListErrors = useCallback(() => {
    dispatch(clearListError());
  }, [dispatch]);

  const clearDetailErrors = useCallback(() => {
    dispatch(clearDetailError());
  }, [dispatch]);

  const clearCreateErrors = useCallback(() => {
    dispatch(clearCreateError());
  }, [dispatch]);

  const clearUpdateErrors = useCallback(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  const clearDeleteErrors = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  const clearChangePasswordErrors = useCallback(() => {
    dispatch(clearChangePasswordError());
  }, [dispatch]);

  const clearUpdateProfileErrors = useCallback(() => {
    dispatch(clearUpdateProfileError());
  }, [dispatch]);

  const clearChangePasswordMeErrors = useCallback(() => {
    dispatch(clearChangePasswordMeError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentUser());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    users,
    pagination,
    currentUser,

    // ========== LOADING STATES ==========
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    isActivating,
    isDeactivating,
    isChangingPassword,
    isUpdatingProfile,
    isChangingPasswordMe,

    // ========== ERRORS ==========
    listError,
    detailError,
    createError,
    updateError,
    deleteError,
    activateError,
    deactivateError,
    changePasswordError,
    updateProfileError,
    changePasswordMeError,

    // ========== ACTIONS ==========
    listUsers,
    getUserById,
    createUser,
    updateUser,
    patchUser,
    deleteUser,
    activateUser,
    deactivateUser,
    changePassword,
    updateProfile,
    changePasswordMe,

    // ========== CLEAR ACTIONS ==========
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearCreateErrors,
    clearUpdateErrors,
    clearDeleteErrors,
    clearChangePasswordErrors,
    clearUpdateProfileErrors,
    clearChangePasswordMeErrors,
    clearCurrent,
  };
}
