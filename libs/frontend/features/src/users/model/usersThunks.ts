import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@entities/user/model';
import { logger } from '@shared/lib/logger';
import { usersService } from '../api/usersService';
import type {
  ListUsersParams,
  ListUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from './types';

/**
 * Thunks para la gestión de usuarios
 */

// ========== LIST ==========
export const listUsersThunk = createAsyncThunk<
  ListUsersResponse,
  ListUsersParams | undefined,
  { rejectValue: string }
>('users/list', async (params, { rejectWithValue }) => {
  try {
    const response = await usersService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de usuarios';
    logger.error('Error en listUsersThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getUserByIdThunk = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('users/getById', async (id, { rejectWithValue }) => {
  try {
    const user = await usersService.getById(id);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener usuario';
    logger.error('Error en getUserByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createUserThunk = createAsyncThunk<
  User,
  CreateUserRequest,
  { rejectValue: string }
>('users/create', async (data, { rejectWithValue }) => {
  try {
    const user = await usersService.create(data);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear usuario';
    logger.error('Error en createUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateUserThunk = createAsyncThunk<
  User,
  { id: string; data: UpdateUserRequest },
  { rejectValue: string }
>('users/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const user = await usersService.update(id, data);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar usuario';
    logger.error('Error en updateUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchUserThunk = createAsyncThunk<
  User,
  { id: string; data: Partial<UpdateUserRequest> },
  { rejectValue: string }
>('users/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const user = await usersService.patch(id, data);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar usuario';
    logger.error('Error en patchUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteUserThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/delete', async (id, { rejectWithValue }) => {
  try {
    await usersService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar usuario';
    logger.error('Error en deleteUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateUserThunk = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('users/activate', async (id, { rejectWithValue }) => {
  try {
    const user = await usersService.activate(id);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar usuario';
    logger.error('Error en activateUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateUserThunk = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('users/deactivate', async (id, { rejectWithValue }) => {
  try {
    const user = await usersService.deactivate(id);
    return user;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar usuario';
    logger.error('Error en deactivateUserThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CHANGE PASSWORD ==========
export const changePasswordThunk = createAsyncThunk<
  { id: string; message: string },
  { id: string; data: ChangePasswordRequest },
  { rejectValue: string }
>('users/changePassword', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await usersService.changePassword(id, data);
    return { id, message: response.message };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al cambiar contraseña';
    logger.error('Error en changePasswordThunk:', error);
    return rejectWithValue(message);
  }
});
