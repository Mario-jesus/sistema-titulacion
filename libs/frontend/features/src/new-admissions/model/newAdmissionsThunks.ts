import { createAsyncThunk } from '@reduxjs/toolkit';
import type { NewAdmission } from '@entities/new-admission';
import { logger } from '@shared/lib/logger';
import { newAdmissionsService } from '../api/newAdmissionsService';
import type {
  ListNewAdmissionsParams,
  ListNewAdmissionsResponse,
  CreateNewAdmissionRequest,
  UpdateNewAdmissionRequest,
} from './types';

/**
 * Thunks para la gestión de registros de nuevo ingreso
 */

// ========== LIST ==========
export const listNewAdmissionsThunk = createAsyncThunk<
  ListNewAdmissionsResponse,
  ListNewAdmissionsParams | undefined,
  { rejectValue: string }
>('newAdmissions/list', async (params, { rejectWithValue }) => {
  try {
    const response = await newAdmissionsService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener registros de ingreso';
    logger.error('Error en listNewAdmissionsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getNewAdmissionByIdThunk = createAsyncThunk<
  NewAdmission,
  string,
  { rejectValue: string }
>('newAdmissions/getById', async (id, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.getById(id);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener registro de ingreso';
    logger.error('Error en getNewAdmissionByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createNewAdmissionThunk = createAsyncThunk<
  NewAdmission,
  CreateNewAdmissionRequest,
  { rejectValue: string }
>('newAdmissions/create', async (data, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.create(data);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear registro de ingreso';
    logger.error('Error en createNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateNewAdmissionThunk = createAsyncThunk<
  NewAdmission,
  { id: string; data: UpdateNewAdmissionRequest },
  { rejectValue: string }
>('newAdmissions/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.update(id, data);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar registro de ingreso';
    logger.error('Error en updateNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchNewAdmissionThunk = createAsyncThunk<
  NewAdmission,
  { id: string; data: Partial<UpdateNewAdmissionRequest> },
  { rejectValue: string }
>('newAdmissions/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.patch(id, data);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar registro de ingreso';
    logger.error('Error en patchNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteNewAdmissionThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('newAdmissions/delete', async (id, { rejectWithValue }) => {
  try {
    await newAdmissionsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar registro de ingreso';
    logger.error('Error en deleteNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateNewAdmissionThunk = createAsyncThunk<
  NewAdmission,
  string,
  { rejectValue: string }
>('newAdmissions/activate', async (id, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.activate(id);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar registro de ingreso';
    logger.error('Error en activateNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateNewAdmissionThunk = createAsyncThunk<
  NewAdmission,
  string,
  { rejectValue: string }
>('newAdmissions/deactivate', async (id, { rejectWithValue }) => {
  try {
    const newAdmission = await newAdmissionsService.deactivate(id);
    return newAdmission;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar registro de ingreso';
    logger.error('Error en deactivateNewAdmissionThunk:', error);
    return rejectWithValue(message);
  }
});
