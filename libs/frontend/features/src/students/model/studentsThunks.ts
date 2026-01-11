import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Student, StudentStatus } from '@entities/student';
import { logger } from '@shared/lib/logger';
import { studentsService } from '../api/studentsService';
import type {
  ListStudentsParams,
  ListStudentsResponse,
  ListInProgressStudentsParams,
  ListInProgressStudentsResponse,
  ListScheduledStudentsParams,
  ListScheduledStudentsResponse,
  ListGraduatedStudentsParams,
  ListGraduatedStudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
} from './types';

/**
 * Thunks para la gestión de estudiantes
 */

// ========== LIST ==========
export const listStudentsThunk = createAsyncThunk<
  ListStudentsResponse,
  ListStudentsParams | undefined,
  { rejectValue: string }
>('students/list', async (params, { rejectWithValue }) => {
  try {
    const response = await studentsService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de estudiantes';
    logger.error('Error en listStudentsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getStudentByIdThunk = createAsyncThunk<
  Student,
  string,
  { rejectValue: string }
>('students/getById', async (id, { rejectWithValue }) => {
  try {
    const student = await studentsService.getById(id);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener estudiante';
    logger.error('Error en getStudentByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createStudentThunk = createAsyncThunk<
  Student,
  CreateStudentRequest,
  { rejectValue: string }
>('students/create', async (data, { rejectWithValue }) => {
  try {
    const student = await studentsService.create(data);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear estudiante';
    logger.error('Error en createStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPDATE ==========
export const updateStudentThunk = createAsyncThunk<
  Student,
  { id: string; data: UpdateStudentRequest },
  { rejectValue: string }
>('students/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const student = await studentsService.update(id, data);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar estudiante';
    logger.error('Error en updateStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== PATCH ==========
export const patchStudentThunk = createAsyncThunk<
  Student,
  { id: string; data: Partial<UpdateStudentRequest> },
  { rejectValue: string }
>('students/patch', async ({ id, data }, { rejectWithValue }) => {
  try {
    const student = await studentsService.patch(id, data);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al actualizar estudiante';
    logger.error('Error en patchStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteStudentThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('students/delete', async (id, { rejectWithValue }) => {
  try {
    await studentsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar estudiante';
    logger.error('Error en deleteStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CHANGE STATUS ==========
export const changeStudentStatusThunk = createAsyncThunk<
  Student,
  { id: string; status: StudentStatus },
  { rejectValue: string }
>('students/changeStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const student = await studentsService.changeStatus(id, status);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al cambiar estado del estudiante';
    logger.error('Error en changeStudentStatusThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== LIST IN PROGRESS ==========
export const listInProgressStudentsThunk = createAsyncThunk<
  ListInProgressStudentsResponse,
  ListInProgressStudentsParams | undefined,
  { rejectValue: string }
>('students/listInProgress', async (params, { rejectWithValue }) => {
  try {
    const response = await studentsService.listInProgress(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de estudiantes en proceso';
    logger.error('Error en listInProgressStudentsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== LIST SCHEDULED ==========
export const listScheduledStudentsThunk = createAsyncThunk<
  ListScheduledStudentsResponse,
  ListScheduledStudentsParams | undefined,
  { rejectValue: string }
>('students/listScheduled', async (params, { rejectWithValue }) => {
  try {
    const response = await studentsService.listScheduled(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de estudiantes programados';
    logger.error('Error en listScheduledStudentsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== LIST GRADUATED ==========
export const listGraduatedStudentsThunk = createAsyncThunk<
  ListGraduatedStudentsResponse,
  ListGraduatedStudentsParams | undefined,
  { rejectValue: string }
>('students/listGraduated', async (params, { rejectWithValue }) => {
  try {
    const response = await studentsService.listGraduated(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de estudiantes titulados';
    logger.error('Error en listGraduatedStudentsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== EGRESS ==========
export const egressStudentThunk = createAsyncThunk<
  Student,
  string,
  { rejectValue: string }
>('students/egress', async (studentId, { rejectWithValue }) => {
  try {
    const student = await studentsService.egress(studentId);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al marcar estudiante como egresado';
    logger.error('Error en egressStudentThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UNEGRESS ==========
export const unegressStudentThunk = createAsyncThunk<
  Student,
  string,
  { rejectValue: string }
>('students/unegress', async (studentId, { rejectWithValue }) => {
  try {
    const student = await studentsService.unegress(studentId);
    return student;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al marcar estudiante como no egresado';
    logger.error('Error en unegressStudentThunk:', error);
    return rejectWithValue(message);
  }
});
