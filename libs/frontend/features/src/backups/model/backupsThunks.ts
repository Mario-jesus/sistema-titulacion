import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@shared/lib/logger';
import { backupsService } from '../api/backupsService';
import type {
  Backup,
  BackupCreateRequest,
  ListBackupsParams,
  ListBackupsResponse,
} from './types';

/**
 * Thunks para la gestión de respaldos
 */

// ========== LIST ==========
export const listBackupsThunk = createAsyncThunk<
  ListBackupsResponse,
  ListBackupsParams | undefined,
  { rejectValue: string }
>('backups/list', async (params, { rejectWithValue }) => {
  try {
    const response = await backupsService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de respaldos';
    logger.error('Error en listBackupsThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY ID ==========
export const getBackupByIdThunk = createAsyncThunk<
  Backup,
  string,
  { rejectValue: string }
>('backups/getById', async (id, { rejectWithValue }) => {
  try {
    const backup = await backupsService.getById(id);
    return backup;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener respaldo';
    logger.error('Error en getBackupByIdThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== CREATE ==========
export const createBackupThunk = createAsyncThunk<
  Backup,
  BackupCreateRequest,
  { rejectValue: string }
>('backups/create', async (data, { rejectWithValue }) => {
  try {
    const backup = await backupsService.create(data);
    return backup;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al crear respaldo';
    logger.error('Error en createBackupThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== DELETE ==========
export const deleteBackupThunk = createAsyncThunk<
  string, // Retorna el ID del respaldo eliminado
  string,
  { rejectValue: string }
>('backups/delete', async (id, { rejectWithValue }) => {
  try {
    await backupsService.delete(id);
    return id;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al eliminar respaldo';
    logger.error('Error en deleteBackupThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== RESTORE ==========
export const restoreBackupThunk = createAsyncThunk<
  { message: string; backupId: string },
  string,
  { rejectValue: string }
>('backups/restore', async (id, { rejectWithValue }) => {
  try {
    const response = await backupsService.restore(id);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al restaurar respaldo';
    logger.error('Error en restoreBackupThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== UPLOAD ==========
export const uploadBackupThunk = createAsyncThunk<
  { message: string },
  File,
  { rejectValue: string }
>('backups/upload', async (file, { rejectWithValue }) => {
  try {
    const response = await backupsService.upload(file);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al subir archivo de respaldo';
    logger.error('Error en uploadBackupThunk:', error);
    return rejectWithValue(message);
  }
});
