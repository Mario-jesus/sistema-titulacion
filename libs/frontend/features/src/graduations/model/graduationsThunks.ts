import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Graduation } from '@entities/graduation';
import { logger } from '@shared/lib/logger';
import { graduationsService } from '../api/graduationsService';
import type { CreateGraduationRequest, UpdateGraduationRequest } from './types';

/**
 * Thunks para la gestión de titulaciones
 */

// ========== GET BY ID ==========
export const getGraduationByIdThunk = createAsyncThunk<
  Graduation,
  string,
  { rejectValue: string }
>('graduations/getById', async (id, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.getById(id);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener titulación';
    logger.error('Error en getGraduationByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createGraduationThunk = createAsyncThunk<
  Graduation,
  CreateGraduationRequest,
  { rejectValue: string }
>('graduations/create', async (data, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.create(data);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear titulación';
    logger.error('Error en createGraduationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateGraduationThunk = createAsyncThunk<
  Graduation,
  { id: string; data: UpdateGraduationRequest },
  { rejectValue: string }
>('graduations/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.update(id, data);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar titulación';
    logger.error('Error en updateGraduationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchGraduationThunk = createAsyncThunk<
  Graduation,
  { id: string; data: Partial<UpdateGraduationRequest> },
  { rejectValue: string }
>('graduations/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.patch(id, data);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar titulación';
    logger.error('Error en patchGraduationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteGraduationThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('graduations/delete', async (id, { rejectWithValue }) => {
  try {
    await graduationsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar titulación';
    logger.error('Error en deleteGraduationThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GRADUATE ==========
export const graduateStudentThunk = createAsyncThunk<
  Graduation,
  string,
  { rejectValue: string }
>('graduations/graduate', async (idStudent, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.graduate(idStudent);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al marcar estudiante como titulado';
    logger.error('Error en graduateStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UNGRADUATE ==========
export const ungraduateStudentThunk = createAsyncThunk<
  Graduation,
  string,
  { rejectValue: string }
>('graduations/ungraduate', async (idStudent, { rejectWithValue }) => {
  try {
    const graduation = await graduationsService.ungraduate(idStudent);
    return graduation;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al desmarcar estudiante como titulado';
    logger.error('Error en ungraduateStudentThunk:', error);
    return rejectWithValue(message);
  }
});
