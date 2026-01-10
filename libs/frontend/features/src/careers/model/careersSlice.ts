import { createSlice } from '@reduxjs/toolkit';
import type { Career } from '@entities/career';
import type { PaginationData } from '@shared/lib/model';
import {
  listCareersThunk,
  getCareerByIdThunk,
  createCareerThunk,
  updateCareerThunk,
  patchCareerThunk,
  deleteCareerThunk,
  activateCareerThunk,
  deactivateCareerThunk,
} from './careersThunks';

export interface CareersState {
  // Lista de carreras
  careers: Career[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Carrera actual (detalle)
  currentCareer: Career | null;
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

const initialState: CareersState = {
  careers: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentCareer: null,
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

const careersSlice = createSlice({
  name: 'careers',
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
    clearCurrentCareer: (state) => {
      state.currentCareer = null;
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
    builder.addCase(listCareersThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listCareersThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.careers = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listCareersThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError = action.payload || 'Error al obtener lista de carreras';
    });

    // ========== GET BY ID ==========
    builder.addCase(getCareerByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getCareerByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentCareer = action.payload;
      state.detailError = null;
    });
    builder.addCase(getCareerByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener carrera';
    });

    // ========== CREATE ==========
    builder.addCase(createCareerThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createCareerThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar la nueva carrera al inicio de la lista
      state.careers.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createCareerThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear carrera';
    });

    // ========== UPDATE ==========
    builder.addCase(updateCareerThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateCareerThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.careers.findIndex(
        (career) => career.id === action.payload.id
      );
      if (index !== -1) {
        state.careers[index] = action.payload;
      }
      // Actualizar carrera actual si es la misma
      if (state.currentCareer && state.currentCareer.id === action.payload.id) {
        state.currentCareer = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateCareerThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar carrera';
    });

    // ========== PATCH ==========
    builder.addCase(patchCareerThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchCareerThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.careers.findIndex(
        (career) => career.id === action.payload.id
      );
      if (index !== -1) {
        state.careers[index] = action.payload;
      }
      // Actualizar carrera actual si es la misma
      if (state.currentCareer && state.currentCareer.id === action.payload.id) {
        state.currentCareer = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchCareerThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar carrera';
    });

    // ========== DELETE ==========
    builder.addCase(deleteCareerThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteCareerThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.careers = state.careers.filter(
        (career) => career.id !== action.payload
      );
      // Limpiar carrera actual si es la eliminada
      if (state.currentCareer && state.currentCareer.id === action.payload) {
        state.currentCareer = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteCareerThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar carrera';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateCareerThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateCareerThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      // Actualizar en la lista
      const index = state.careers.findIndex(
        (career) => career.id === action.payload.id
      );
      if (index !== -1) {
        state.careers[index] = action.payload;
      }
      // Actualizar carrera actual si es la misma
      if (state.currentCareer && state.currentCareer.id === action.payload.id) {
        state.currentCareer = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateCareerThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar carrera';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateCareerThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateCareerThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      // Actualizar en la lista
      const index = state.careers.findIndex(
        (career) => career.id === action.payload.id
      );
      if (index !== -1) {
        state.careers[index] = action.payload;
      }
      // Actualizar carrera actual si es la misma
      if (state.currentCareer && state.currentCareer.id === action.payload.id) {
        state.currentCareer = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateCareerThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError = action.payload || 'Error al desactivar carrera';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentCareer,
  clearAllErrors,
} = careersSlice.actions;

export const careersReducer = careersSlice.reducer;
