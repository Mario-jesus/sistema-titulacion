import { createSlice } from '@reduxjs/toolkit';
import type { Backup } from './types';
import type { PaginationData } from '@shared/lib/model';
import {
  listBackupsThunk,
  getBackupByIdThunk,
  createBackupThunk,
  deleteBackupThunk,
  restoreBackupThunk,
  uploadBackupThunk,
} from './backupsThunks';

export interface BackupsState {
  // Lista de respaldos
  backups: Backup[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Respaldo actual (detalle)
  currentBackup: Backup | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isDeleting: boolean;
  deleteError: string | null;

  isRestoring: boolean;
  restoreError: string | null;

  isUploading: boolean;
  uploadError: string | null;
}

const initialState: BackupsState = {
  backups: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentBackup: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isDeleting: false,
  deleteError: null,

  isRestoring: false,
  restoreError: null,

  isUploading: false,
  uploadError: null,
};

const backupsSlice = createSlice({
  name: 'backups',
  initialState,
  reducers: {
    clearListError: (state) => {
      state.listError = null;
    },
    clearDetailError: (state) => {
      state.detailError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearRestoreError: (state) => {
      state.restoreError = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    clearCurrentBackup: (state) => {
      state.currentBackup = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.deleteError = null;
      state.restoreError = null;
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LIST ==========
    builder.addCase(listBackupsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listBackupsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.backups = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listBackupsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError = action.payload || 'Error al obtener lista de respaldos';
    });

    // ========== GET BY ID ==========
    builder.addCase(getBackupByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getBackupByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentBackup = action.payload;
      state.detailError = null;
    });
    builder.addCase(getBackupByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener respaldo';
    });

    // ========== CREATE ==========
    builder.addCase(createBackupThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createBackupThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar el nuevo respaldo al inicio de la lista
      state.backups.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createBackupThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear respaldo';
    });

    // ========== DELETE ==========
    builder.addCase(deleteBackupThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteBackupThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.backups = state.backups.filter(
        (backup) => backup.id !== action.payload
      );
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      // Limpiar respaldo actual si es el eliminado
      if (state.currentBackup && state.currentBackup.id === action.payload) {
        state.currentBackup = null;
      }
      state.deleteError = null;
    });
    builder.addCase(deleteBackupThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar respaldo';
    });

    // ========== RESTORE ==========
    builder.addCase(restoreBackupThunk.pending, (state) => {
      state.isRestoring = true;
      state.restoreError = null;
    });
    builder.addCase(restoreBackupThunk.fulfilled, (state) => {
      state.isRestoring = false;
      state.restoreError = null;
    });
    builder.addCase(restoreBackupThunk.rejected, (state, action) => {
      state.isRestoring = false;
      state.restoreError = action.payload || 'Error al restaurar respaldo';
    });

    // ========== UPLOAD ==========
    builder.addCase(uploadBackupThunk.pending, (state) => {
      state.isUploading = true;
      state.uploadError = null;
    });
    builder.addCase(uploadBackupThunk.fulfilled, (state) => {
      state.isUploading = false;
      state.uploadError = null;
    });
    builder.addCase(uploadBackupThunk.rejected, (state, action) => {
      state.isUploading = false;
      state.uploadError =
        action.payload || 'Error al subir archivo de respaldo';
    });
  },
});

export const backupsReducer = backupsSlice.reducer;

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearDeleteError,
  clearRestoreError,
  clearUploadError,
  clearCurrentBackup,
  clearAllErrors,
} = backupsSlice.actions;
