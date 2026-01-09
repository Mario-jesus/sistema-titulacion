import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Generation } from '@entities/generation';
import { logger } from '@shared/lib/logger';
import { generationsService } from '../api/generationsService';
import type {
  ListGenerationsParams,
  ListGenerationsResponse,
  CreateGenerationRequest,
  UpdateGenerationRequest,
} from './types';

/**
 * Thunks para la gestión de generaciones
 */

// ========== LIST ==========
export const listGenerationsThunk = createAsyncThunk<
  ListGenerationsResponse,
  ListGenerationsParams | undefined,
  { rejectValue: string }
>('generations/list', async (params, { rejectWithValue }) => {
  try {
    const response = await generationsService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de generaciones';
    logger.error('Error en listGenerationsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getGenerationByIdThunk = createAsyncThunk<
  Generation,
  string,
  { rejectValue: string }
>('generations/getById', async (id, { rejectWithValue }) => {
  try {
    const generation = await generationsService.getById(id);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener generación';
    logger.error('Error en getGenerationByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createGenerationThunk = createAsyncThunk<
  Generation,
  CreateGenerationRequest,
  { rejectValue: string }
>('generations/create', async (data, { rejectWithValue }) => {
  try {
    const generation = await generationsService.create(data);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear generación';
    logger.error('Error en createGenerationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateGenerationThunk = createAsyncThunk<
  Generation,
  { id: string; data: UpdateGenerationRequest },
  { rejectValue: string }
>('generations/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const generation = await generationsService.update(id, data);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar generación';
    logger.error('Error en updateGenerationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchGenerationThunk = createAsyncThunk<
  Generation,
  { id: string; data: Partial<UpdateGenerationRequest> },
  { rejectValue: string }
>('generations/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const generation = await generationsService.patch(id, data);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar generación';
    logger.error('Error en patchGenerationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteGenerationThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('generations/delete', async (id, { rejectWithValue }) => {
  try {
    await generationsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar generación';
    logger.error('Error en deleteGenerationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateGenerationThunk = createAsyncThunk<
  Generation,
  string,
  { rejectValue: string }
>('generations/activate', async (id, { rejectWithValue }) => {
  try {
    const generation = await generationsService.activate(id);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar generación';
    logger.error('Error en activateGenerationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateGenerationThunk = createAsyncThunk<
  Generation,
  string,
  { rejectValue: string }
>('generations/deactivate', async (id, { rejectWithValue }) => {
  try {
    const generation = await generationsService.deactivate(id);
    return generation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar generación';
    logger.error('Error en deactivateGenerationThunk:', error);
    return rejectWithValue(message);
  }
});
