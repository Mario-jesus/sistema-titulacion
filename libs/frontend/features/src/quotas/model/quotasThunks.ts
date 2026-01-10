import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Quota } from '@entities/quota';
import { logger } from '@shared/lib/logger';
import { quotasService } from '../api/quotasService';
import type {
  ListQuotasParams,
  ListQuotasResponse,
  CreateQuotaRequest,
  UpdateQuotaRequest,
} from './types';

/**
 * Thunks para la gestión de cupos
 */

// ========== LIST ==========
export const listQuotasThunk = createAsyncThunk<
  ListQuotasResponse,
  ListQuotasParams | undefined,
  { rejectValue: string }
>('quotas/list', async (params, { rejectWithValue }) => {
  try {
    const response = await quotasService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de cupos';
    logger.error('Error en listQuotasThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getQuotaByIdThunk = createAsyncThunk<
  Quota,
  string,
  { rejectValue: string }
>('quotas/getById', async (id, { rejectWithValue }) => {
  try {
    const quota = await quotasService.getById(id);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener cupo';
    logger.error('Error en getQuotaByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createQuotaThunk = createAsyncThunk<
  Quota,
  CreateQuotaRequest,
  { rejectValue: string }
>('quotas/create', async (data, { rejectWithValue }) => {
  try {
    const quota = await quotasService.create(data);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear cupo';
    logger.error('Error en createQuotaThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateQuotaThunk = createAsyncThunk<
  Quota,
  { id: string; data: UpdateQuotaRequest },
  { rejectValue: string }
>('quotas/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const quota = await quotasService.update(id, data);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar cupo';
    logger.error('Error en updateQuotaThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchQuotaThunk = createAsyncThunk<
  Quota,
  { id: string; data: Partial<UpdateQuotaRequest> },
  { rejectValue: string }
>('quotas/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const quota = await quotasService.patch(id, data);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar cupo';
    logger.error('Error en patchQuotaThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteQuotaThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('quotas/delete', async (id, { rejectWithValue }) => {
  try {
    await quotasService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar cupo';
    logger.error('Error en deleteQuotaThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateQuotaThunk = createAsyncThunk<
  Quota,
  string,
  { rejectValue: string }
>('quotas/activate', async (id, { rejectWithValue }) => {
  try {
    const quota = await quotasService.activate(id);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar cupo';
    logger.error('Error en activateQuotaThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateQuotaThunk = createAsyncThunk<
  Quota,
  string,
  { rejectValue: string }
>('quotas/deactivate', async (id, { rejectWithValue }) => {
  try {
    const quota = await quotasService.deactivate(id);
    return quota;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar cupo';
    logger.error('Error en deactivateQuotaThunk:', error);
    return rejectWithValue(message);
  }
});
