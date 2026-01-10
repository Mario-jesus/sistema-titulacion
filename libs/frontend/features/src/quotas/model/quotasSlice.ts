import { createSlice } from '@reduxjs/toolkit';
import type { Quota } from '@entities/quota';
import type { PaginationData } from '@shared/lib/model';
import {
  listQuotasThunk,
  getQuotaByIdThunk,
  createQuotaThunk,
  updateQuotaThunk,
  patchQuotaThunk,
  deleteQuotaThunk,
  activateQuotaThunk,
  deactivateQuotaThunk,
} from './quotasThunks';

export interface QuotasState {
  // Lista de cupos
  quotas: Quota[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Cupo actual (detalle)
  currentQuota: Quota | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  isDeleting: boolean;
  deleteError: string | null;

  isActivating: boolean;
  activateError: string | null;

  isDeactivating: boolean;
  deactivateError: string | null;
}

const initialState: QuotasState = {
  quotas: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentQuota: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  isDeleting: false,
  deleteError: null,

  isActivating: false,
  activateError: null,

  isDeactivating: false,
  deactivateError: null,
};

const quotasSlice = createSlice({
  name: 'quotas',
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
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearCurrentQuota: (state) => {
      state.currentQuota = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.activateError = null;
      state.deactivateError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LIST ==========
    builder.addCase(listQuotasThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listQuotasThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.quotas = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listQuotasThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError = action.payload || 'Error al obtener lista de cupos';
    });

    // ========== GET BY ID ==========
    builder.addCase(getQuotaByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getQuotaByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentQuota = action.payload;
      state.detailError = null;
    });
    builder.addCase(getQuotaByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener cupo';
    });

    // ========== CREATE ==========
    builder.addCase(createQuotaThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createQuotaThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar el nuevo cupo al inicio de la lista
      state.quotas.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createQuotaThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear cupo';
    });

    // ========== UPDATE ==========
    builder.addCase(updateQuotaThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateQuotaThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.quotas.findIndex(
        (quota) => quota.id === action.payload.id
      );
      if (index !== -1) {
        state.quotas[index] = action.payload;
      }
      // Actualizar cupo actual si es el mismo
      if (state.currentQuota && state.currentQuota.id === action.payload.id) {
        state.currentQuota = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateQuotaThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar cupo';
    });

    // ========== PATCH ==========
    builder.addCase(patchQuotaThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchQuotaThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.quotas.findIndex(
        (quota) => quota.id === action.payload.id
      );
      if (index !== -1) {
        state.quotas[index] = action.payload;
      }
      // Actualizar cupo actual si es el mismo
      if (state.currentQuota && state.currentQuota.id === action.payload.id) {
        state.currentQuota = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchQuotaThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar cupo';
    });

    // ========== DELETE ==========
    builder.addCase(deleteQuotaThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteQuotaThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.quotas = state.quotas.filter(
        (quota) => quota.id !== action.payload
      );
      // Limpiar cupo actual si es el eliminado
      if (state.currentQuota && state.currentQuota.id === action.payload) {
        state.currentQuota = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteQuotaThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar cupo';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateQuotaThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateQuotaThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      // Actualizar en la lista
      const index = state.quotas.findIndex(
        (quota) => quota.id === action.payload.id
      );
      if (index !== -1) {
        state.quotas[index] = action.payload;
      }
      // Actualizar cupo actual si es el mismo
      if (state.currentQuota && state.currentQuota.id === action.payload.id) {
        state.currentQuota = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateQuotaThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar cupo';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateQuotaThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateQuotaThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      // Actualizar en la lista
      const index = state.quotas.findIndex(
        (quota) => quota.id === action.payload.id
      );
      if (index !== -1) {
        state.quotas[index] = action.payload;
      }
      // Actualizar cupo actual si es el mismo
      if (state.currentQuota && state.currentQuota.id === action.payload.id) {
        state.currentQuota = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateQuotaThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError = action.payload || 'Error al desactivar cupo';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentQuota,
  clearAllErrors,
} = quotasSlice.actions;

export const quotasReducer = quotasSlice.reducer;
