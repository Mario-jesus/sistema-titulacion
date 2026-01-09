import { createSlice } from '@reduxjs/toolkit';
import type { Generation } from '@entities/generation';
import type { PaginationData } from '@shared/lib/model';
import {
  listGenerationsThunk,
  getGenerationByIdThunk,
  createGenerationThunk,
  updateGenerationThunk,
  patchGenerationThunk,
  deleteGenerationThunk,
  activateGenerationThunk,
  deactivateGenerationThunk,
} from './generationsThunks';

export interface GenerationsState {
  // Lista de generaciones
  generations: Generation[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Generación actual (detalle)
  currentGeneration: Generation | null;
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

const initialState: GenerationsState = {
  generations: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentGeneration: null,
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

const generationsSlice = createSlice({
  name: 'generations',
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
    clearCurrentGeneration: (state) => {
      state.currentGeneration = null;
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
    builder.addCase(listGenerationsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listGenerationsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.generations = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listGenerationsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al obtener lista de generaciones';
    });

    // ========== GET BY ID ==========
    builder.addCase(getGenerationByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getGenerationByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentGeneration = action.payload;
      state.detailError = null;
    });
    builder.addCase(getGenerationByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener generación';
    });

    // ========== CREATE ==========
    builder.addCase(createGenerationThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createGenerationThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar la nueva generación al inicio de la lista
      state.generations.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createGenerationThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear generación';
    });

    // ========== UPDATE ==========
    builder.addCase(updateGenerationThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateGenerationThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.generations.findIndex(
        (gen) => gen.id === action.payload.id
      );
      if (index !== -1) {
        state.generations[index] = action.payload;
      }
      // Actualizar generación actual si es la misma
      if (
        state.currentGeneration &&
        state.currentGeneration.id === action.payload.id
      ) {
        state.currentGeneration = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateGenerationThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar generación';
    });

    // ========== PATCH ==========
    builder.addCase(patchGenerationThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchGenerationThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.generations.findIndex(
        (gen) => gen.id === action.payload.id
      );
      if (index !== -1) {
        state.generations[index] = action.payload;
      }
      // Actualizar generación actual si es la misma
      if (
        state.currentGeneration &&
        state.currentGeneration.id === action.payload.id
      ) {
        state.currentGeneration = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchGenerationThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar generación';
    });

    // ========== DELETE ==========
    builder.addCase(deleteGenerationThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteGenerationThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.generations = state.generations.filter(
        (gen) => gen.id !== action.payload
      );
      // Limpiar generación actual si es la eliminada
      if (
        state.currentGeneration &&
        state.currentGeneration.id === action.payload
      ) {
        state.currentGeneration = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteGenerationThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar generación';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateGenerationThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateGenerationThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      // Actualizar en la lista
      const index = state.generations.findIndex(
        (gen) => gen.id === action.payload.id
      );
      if (index !== -1) {
        state.generations[index] = action.payload;
      }
      // Actualizar generación actual si es la misma
      if (
        state.currentGeneration &&
        state.currentGeneration.id === action.payload.id
      ) {
        state.currentGeneration = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateGenerationThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar generación';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateGenerationThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateGenerationThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      // Actualizar en la lista
      const index = state.generations.findIndex(
        (gen) => gen.id === action.payload.id
      );
      if (index !== -1) {
        state.generations[index] = action.payload;
      }
      // Actualizar generación actual si es la misma
      if (
        state.currentGeneration &&
        state.currentGeneration.id === action.payload.id
      ) {
        state.currentGeneration = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateGenerationThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError =
        action.payload || 'Error al desactivar generación';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentGeneration,
  clearAllErrors,
} = generationsSlice.actions;

export const generationsReducer = generationsSlice.reducer;
