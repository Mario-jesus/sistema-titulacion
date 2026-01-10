import { createAsyncThunk } from '@reduxjs/toolkit';
import type { GraduationOption } from '@entities/graduation-option';
import { logger } from '@shared/lib/logger';
import { graduationOptionsService } from '../api/graduationOptionsService';
import type {
  ListGraduationOptionsParams,
  ListGraduationOptionsResponse,
  CreateGraduationOptionRequest,
  UpdateGraduationOptionRequest,
} from './types';

/**
 * Thunks para la gestión de opciones de titulación
 */

// ========== LIST ==========
export const listGraduationOptionsThunk = createAsyncThunk<
  ListGraduationOptionsResponse,
  ListGraduationOptionsParams | undefined,
  { rejectValue: string }
>(
  'graduationOptions/list',
  async (params, { rejectWithValue }) => {
    try {
      const response = await graduationOptionsService.list(params);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al obtener lista de opciones de titulación';
      logger.error('Error en listGraduationOptionsThunk:', error);
      return rejectWithValue(message);
    }
  }
);

// ========== GET BY ID ==========
export const getGraduationOptionByIdThunk = createAsyncThunk<
  GraduationOption,
  string,
  { rejectValue: string }
>('graduationOptions/getById', async (id, { rejectWithValue }) => {
  try {
    const option = await graduationOptionsService.getById(id);
    return option;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener opción de titulación';
    logger.error('Error en getGraduationOptionByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createGraduationOptionThunk = createAsyncThunk<
  GraduationOption,
  CreateGraduationOptionRequest,
  { rejectValue: string }
>(
  'graduationOptions/create',
  async (data, { rejectWithValue }) => {
    try {
      const option = await graduationOptionsService.create(data);
      return option;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear opción de titulación';
      logger.error('Error en createGraduationOptionThunk:', error);
      return rejectWithValue(message);
    }
  }
);

// ========== UPDATE ==========
export const updateGraduationOptionThunk = createAsyncThunk<
  GraduationOption,
  { id: string; data: UpdateGraduationOptionRequest },
  { rejectValue: string }
>(
  'graduationOptions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const option = await graduationOptionsService.update(id, data);
      return option;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al actualizar opción de titulación';
      logger.error('Error en updateGraduationOptionThunk:', error);
      return rejectWithValue(message);
    }
  }
);

// ========== PATCH ==========
export const patchGraduationOptionThunk = createAsyncThunk<
  GraduationOption,
  { id: string; data: Partial<UpdateGraduationOptionRequest> },
  { rejectValue: string }
>(
  'graduationOptions/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const option = await graduationOptionsService.patch(id, data);
      return option;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al actualizar opción de titulación';
      logger.error('Error en patchGraduationOptionThunk:', error);
      return rejectWithValue(message);
    }
  }
);

// ========== DELETE ==========
export const deleteGraduationOptionThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('graduationOptions/delete', async (id, { rejectWithValue }) => {
  try {
    await graduationOptionsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar opción de titulación';
    logger.error('Error en deleteGraduationOptionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateGraduationOptionThunk = createAsyncThunk<
  GraduationOption,
  string,
  { rejectValue: string }
>('graduationOptions/activate', async (id, { rejectWithValue }) => {
  try {
    const option = await graduationOptionsService.activate(id);
    return option;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar opción de titulación';
    logger.error('Error en activateGraduationOptionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateGraduationOptionThunk = createAsyncThunk<
  GraduationOption,
  string,
  { rejectValue: string }
>('graduationOptions/deactivate', async (id, { rejectWithValue }) => {
  try {
    const option = await graduationOptionsService.deactivate(id);
    return option;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar opción de titulación';
    logger.error('Error en deactivateGraduationOptionThunk:', error);
    return rejectWithValue(message);
  }
});
