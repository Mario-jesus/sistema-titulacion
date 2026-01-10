import { createSlice } from '@reduxjs/toolkit';
import type { Modality } from '@entities/modality';
import type { PaginationData } from '@shared/lib/model';
import {
  listModalitiesThunk,
  getModalityByIdThunk,
  createModalityThunk,
  updateModalityThunk,
  patchModalityThunk,
  deleteModalityThunk,
  activateModalityThunk,
  deactivateModalityThunk,
} from './modalitiesThunks';

export interface ModalitiesState {
  // Lista de modalidades
  modalities: Modality[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Modalidad actual (detalle)
  currentModality: Modality | null;
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

const initialState: ModalitiesState = {
  modalities: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentModality: null,
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

const modalitiesSlice = createSlice({
  name: 'modalities',
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
    clearCurrentModality: (state) => {
      state.currentModality = null;
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
    builder.addCase(listModalitiesThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listModalitiesThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.modalities = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listModalitiesThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al obtener lista de modalidades';
    });

    // ========== GET BY ID ==========
    builder.addCase(getModalityByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getModalityByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentModality = action.payload;
      state.detailError = null;
    });
    builder.addCase(getModalityByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener modalidad';
    });

    // ========== CREATE ==========
    builder.addCase(createModalityThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createModalityThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar la nueva modalidad al inicio de la lista
      state.modalities.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createModalityThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear modalidad';
    });

    // ========== UPDATE ==========
    builder.addCase(updateModalityThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateModalityThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.modalities.findIndex(
        (mod) => mod.id === action.payload.id
      );
      if (index !== -1) {
        state.modalities[index] = action.payload;
      }
      // Actualizar modalidad actual si es la misma
      if (
        state.currentModality &&
        state.currentModality.id === action.payload.id
      ) {
        state.currentModality = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateModalityThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar modalidad';
    });

    // ========== PATCH ==========
    builder.addCase(patchModalityThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchModalityThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.modalities.findIndex(
        (mod) => mod.id === action.payload.id
      );
      if (index !== -1) {
        state.modalities[index] = action.payload;
      }
      // Actualizar modalidad actual si es la misma
      if (
        state.currentModality &&
        state.currentModality.id === action.payload.id
      ) {
        state.currentModality = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchModalityThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar modalidad';
    });

    // ========== DELETE ==========
    builder.addCase(deleteModalityThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteModalityThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.modalities = state.modalities.filter(
        (mod) => mod.id !== action.payload
      );
      // Limpiar modalidad actual si es la eliminada
      if (
        state.currentModality &&
        state.currentModality.id === action.payload
      ) {
        state.currentModality = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteModalityThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar modalidad';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateModalityThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateModalityThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      // Actualizar en la lista
      const index = state.modalities.findIndex(
        (mod) => mod.id === action.payload.id
      );
      if (index !== -1) {
        state.modalities[index] = action.payload;
      }
      // Actualizar modalidad actual si es la misma
      if (
        state.currentModality &&
        state.currentModality.id === action.payload.id
      ) {
        state.currentModality = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateModalityThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar modalidad';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateModalityThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateModalityThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      // Actualizar en la lista
      const index = state.modalities.findIndex(
        (mod) => mod.id === action.payload.id
      );
      if (index !== -1) {
        state.modalities[index] = action.payload;
      }
      // Actualizar modalidad actual si es la misma
      if (
        state.currentModality &&
        state.currentModality.id === action.payload.id
      ) {
        state.currentModality = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateModalityThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError = action.payload || 'Error al desactivar modalidad';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentModality,
  clearAllErrors,
} = modalitiesSlice.actions;

export const modalitiesReducer = modalitiesSlice.reducer;
