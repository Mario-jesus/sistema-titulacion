import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CapturedFields } from '@entities/captured-fields';
import { logger } from '@shared/lib/logger';
import { capturedFieldsService } from '../api/capturedFieldsService';
import type {
  CreateCapturedFieldsRequest,
  UpdateCapturedFieldsRequest,
} from './types';

/**
 * Thunks para la gestión de campos capturados
 */

// ========== GET BY ID ==========
export const getCapturedFieldsByIdThunk = createAsyncThunk<
  CapturedFields,
  string,
  { rejectValue: string }
>('capturedFields/getById', async (id, { rejectWithValue }) => {
  try {
    const capturedFields = await capturedFieldsService.getById(id);
    return capturedFields;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener campos capturados';
    logger.error('Error en getCapturedFieldsByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createCapturedFieldsThunk = createAsyncThunk<
  CapturedFields,
  CreateCapturedFieldsRequest,
  { rejectValue: string }
>('capturedFields/create', async (data, { rejectWithValue }) => {
  try {
    const capturedFields = await capturedFieldsService.create(data);
    return capturedFields;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear campos capturados';
    logger.error('Error en createCapturedFieldsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateCapturedFieldsThunk = createAsyncThunk<
  CapturedFields,
  { id: string; data: UpdateCapturedFieldsRequest },
  { rejectValue: string }
>('capturedFields/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const capturedFields = await capturedFieldsService.update(id, data);
    return capturedFields;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar campos capturados';
    logger.error('Error en updateCapturedFieldsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchCapturedFieldsThunk = createAsyncThunk<
  CapturedFields,
  { id: string; data: Partial<UpdateCapturedFieldsRequest> },
  { rejectValue: string }
>('capturedFields/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const capturedFields = await capturedFieldsService.patch(id, data);
    return capturedFields;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar campos capturados';
    logger.error('Error en patchCapturedFieldsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteCapturedFieldsThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('capturedFields/delete', async (id, { rejectWithValue }) => {
  try {
    await capturedFieldsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar campos capturados';
    logger.error('Error en deleteCapturedFieldsThunk:', error);
    return rejectWithValue(message);
  }
});
