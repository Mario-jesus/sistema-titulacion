import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Career } from '@entities/career';
import { logger } from '@shared/lib/logger';
import { careersService } from '../api/careersService';
import type {
  ListCareersParams,
  ListCareersResponse,
  CreateCareerRequest,
  UpdateCareerRequest,
} from './types';

/**
 * Thunks para la gestión de carreras
 */

// ========== LIST ==========
export const listCareersThunk = createAsyncThunk<
  ListCareersResponse,
  ListCareersParams | undefined,
  { rejectValue: string }
>('careers/list', async (params, { rejectWithValue }) => {
  try {
    const response = await careersService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de carreras';
    logger.error('Error en listCareersThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getCareerByIdThunk = createAsyncThunk<
  Career,
  string,
  { rejectValue: string }
>('careers/getById', async (id, { rejectWithValue }) => {
  try {
    const career = await careersService.getById(id);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener carrera';
    logger.error('Error en getCareerByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createCareerThunk = createAsyncThunk<
  Career,
  CreateCareerRequest,
  { rejectValue: string }
>('careers/create', async (data, { rejectWithValue }) => {
  try {
    const career = await careersService.create(data);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear carrera';
    logger.error('Error en createCareerThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateCareerThunk = createAsyncThunk<
  Career,
  { id: string; data: UpdateCareerRequest },
  { rejectValue: string }
>('careers/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const career = await careersService.update(id, data);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar carrera';
    logger.error('Error en updateCareerThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchCareerThunk = createAsyncThunk<
  Career,
  { id: string; data: Partial<UpdateCareerRequest> },
  { rejectValue: string }
>('careers/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const career = await careersService.patch(id, data);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar carrera';
    logger.error('Error en patchCareerThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteCareerThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('careers/delete', async (id, { rejectWithValue }) => {
  try {
    await careersService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar carrera';
    logger.error('Error en deleteCareerThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateCareerThunk = createAsyncThunk<
  Career,
  string,
  { rejectValue: string }
>('careers/activate', async (id, { rejectWithValue }) => {
  try {
    const career = await careersService.activate(id);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar carrera';
    logger.error('Error en activateCareerThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateCareerThunk = createAsyncThunk<
  Career,
  string,
  { rejectValue: string }
>('careers/deactivate', async (id, { rejectWithValue }) => {
  try {
    const career = await careersService.deactivate(id);
    return career;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar carrera';
    logger.error('Error en deactivateCareerThunk:', error);
    return rejectWithValue(message);
  }
});
