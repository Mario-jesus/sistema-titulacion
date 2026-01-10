import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Modality } from '@entities/modality';
import { logger } from '@shared/lib/logger';
import { modalitiesService } from '../api/modalitiesService';
import type {
  ListModalitiesParams,
  ListModalitiesResponse,
  CreateModalityRequest,
  UpdateModalityRequest,
} from './types';

/**
 * Thunks para la gestión de modalidades
 */

// ========== LIST ==========
export const listModalitiesThunk = createAsyncThunk<
  ListModalitiesResponse,
  ListModalitiesParams | undefined,
  { rejectValue: string }
>('modalities/list', async (params, { rejectWithValue }) => {
  try {
    const response = await modalitiesService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de modalidades';
    logger.error('Error en listModalitiesThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getModalityByIdThunk = createAsyncThunk<
  Modality,
  string,
  { rejectValue: string }
>('modalities/getById', async (id, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.getById(id);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener modalidad';
    logger.error('Error en getModalityByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createModalityThunk = createAsyncThunk<
  Modality,
  CreateModalityRequest,
  { rejectValue: string }
>('modalities/create', async (data, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.create(data);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear modalidad';
    logger.error('Error en createModalityThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateModalityThunk = createAsyncThunk<
  Modality,
  { id: string; data: UpdateModalityRequest },
  { rejectValue: string }
>('modalities/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.update(id, data);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar modalidad';
    logger.error('Error en updateModalityThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchModalityThunk = createAsyncThunk<
  Modality,
  { id: string; data: Partial<UpdateModalityRequest> },
  { rejectValue: string }
>('modalities/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.patch(id, data);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar modalidad';
    logger.error('Error en patchModalityThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteModalityThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('modalities/delete', async (id, { rejectWithValue }) => {
  try {
    await modalitiesService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar modalidad';
    logger.error('Error en deleteModalityThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== ACTIVATE ==========
export const activateModalityThunk = createAsyncThunk<
  Modality,
  string,
  { rejectValue: string }
>('modalities/activate', async (id, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.activate(id);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al activar modalidad';
    logger.error('Error en activateModalityThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DEACTIVATE ==========
export const deactivateModalityThunk = createAsyncThunk<
  Modality,
  string,
  { rejectValue: string }
>('modalities/deactivate', async (id, { rejectWithValue }) => {
  try {
    const modality = await modalitiesService.deactivate(id);
    return modality;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desactivar modalidad';
    logger.error('Error en deactivateModalityThunk:', error);
    return rejectWithValue(message);
  }
});
