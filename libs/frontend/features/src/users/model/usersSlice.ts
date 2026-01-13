import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@entities/user/model';
import type { PaginationData } from '@shared/lib/model';
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
} from './usersThunks';

export interface UsersState {
  // Lista de usuarios
  users: User[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Usuario actual (detalle)
  currentUser: User | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  isDeleting: boolean;
  deleteError: string | null;

  isActivating: boolean;
  activateError: string | null;

  isDeactivating: boolean;
  deactivateError: string | null;

  isChangingPassword: boolean;
  changePasswordError: string | null;

  isUpdatingProfile: boolean;
  updateProfileError: string | null;

  isChangingPasswordMe: boolean;
  changePasswordMeError: string | null;
}

const initialState: UsersState = {
  users: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentUser: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  isDeleting: false,
  deleteError: null,

  isActivating: false,
  activateError: null,

  isDeactivating: false,
  deactivateError: null,

  isChangingPassword: false,
  changePasswordError: null,

  isUpdatingProfile: false,
  updateProfileError: null,

  isChangingPasswordMe: false,
  changePasswordMeError: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearListError: (state) => {
      state.listError = null;
    },
    clearDetailError: (state) => {
      state.detailError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearChangePasswordError: (state) => {
      state.changePasswordError = null;
    },
    clearUpdateProfileError: (state) => {
      state.updateProfileError = null;
    },
    clearChangePasswordMeError: (state) => {
      state.changePasswordMeError = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.activateError = null;
      state.deactivateError = null;
      state.changePasswordError = null;
      state.updateProfileError = null;
      state.changePasswordMeError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LIST ==========
    builder.addCase(listUsersThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listUsersThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.users = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listUsersThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError = action.payload || 'Error al obtener lista de usuarios';
    });

    // ========== GET BY ID ==========
    builder.addCase(getUserByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getUserByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentUser = action.payload;
      state.detailError = null;
    });
    builder.addCase(getUserByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener usuario';
    });

    // ========== CREATE ==========
    builder.addCase(createUserThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createUserThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar el nuevo usuario al inicio de la lista
      state.users.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createUserThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear usuario';
    });

    // ========== UPDATE ==========
    builder.addCase(updateUserThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateUserThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Actualizar usuario actual si es el mismo
      if (state.currentUser && state.currentUser.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateUserThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar usuario';
    });

    // ========== PATCH ==========
    builder.addCase(patchUserThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchUserThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Actualizar usuario actual si es el mismo
      if (state.currentUser && state.currentUser.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchUserThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar usuario';
    });

    // ========== DELETE ==========
    builder.addCase(deleteUserThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteUserThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.users = state.users.filter((user) => user.id !== action.payload);
      // Limpiar usuario actual si es el eliminado
      if (state.currentUser && state.currentUser.id === action.payload) {
        state.currentUser = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteUserThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar usuario';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateUserThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateUserThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      // Actualizar en la lista
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Actualizar usuario actual si es el mismo
      if (state.currentUser && state.currentUser.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateUserThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar usuario';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateUserThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateUserThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      // Actualizar en la lista
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Actualizar usuario actual si es el mismo
      if (state.currentUser && state.currentUser.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateUserThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError = action.payload || 'Error al desactivar usuario';
    });

    // ========== CHANGE PASSWORD ==========
    builder.addCase(changePasswordThunk.pending, (state) => {
      state.isChangingPassword = true;
      state.changePasswordError = null;
    });
    builder.addCase(changePasswordThunk.fulfilled, (state) => {
      state.isChangingPassword = false;
      state.changePasswordError = null;
      // No actualizamos el usuario porque la contraseña no se retorna
    });
    builder.addCase(changePasswordThunk.rejected, (state, action) => {
      state.isChangingPassword = false;
      state.changePasswordError =
        action.payload || 'Error al cambiar contraseña';
    });

    // ========== UPDATE PROFILE ==========
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.isUpdatingProfile = true;
      state.updateProfileError = null;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.isUpdatingProfile = false;
      // Actualizar en la lista si existe
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      // Actualizar usuario actual si es el mismo
      if (state.currentUser && state.currentUser.id === action.payload.id) {
        state.currentUser = action.payload;
      }
      state.updateProfileError = null;
    });
    builder.addCase(updateProfileThunk.rejected, (state, action) => {
      state.isUpdatingProfile = false;
      state.updateProfileError = action.payload || 'Error al actualizar perfil';
    });

    // ========== CHANGE PASSWORD ME ==========
    builder.addCase(changePasswordMeThunk.pending, (state) => {
      state.isChangingPasswordMe = true;
      state.changePasswordMeError = null;
    });
    builder.addCase(changePasswordMeThunk.fulfilled, (state) => {
      state.isChangingPasswordMe = false;
      state.changePasswordMeError = null;
      // No actualizamos el usuario porque la contraseña no se retorna
    });
    builder.addCase(changePasswordMeThunk.rejected, (state, action) => {
      state.isChangingPasswordMe = false;
      state.changePasswordMeError =
        action.payload || 'Error al cambiar contraseña';
    });
  },
});

export const {
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
} = usersSlice.actions;

export const usersReducer = usersSlice.reducer;
