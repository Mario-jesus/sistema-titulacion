import { createSlice } from '@reduxjs/toolkit';
import type { GraduationOption } from '@entities/graduation-option';
import type { PaginationData } from '@shared/lib/model';
import {
  listGraduationOptionsThunk,
  getGraduationOptionByIdThunk,
  createGraduationOptionThunk,
  updateGraduationOptionThunk,
  patchGraduationOptionThunk,
  deleteGraduationOptionThunk,
  activateGraduationOptionThunk,
  deactivateGraduationOptionThunk,
} from './graduationOptionsThunks';

export interface GraduationOptionsState {
  // Lista de opciones de titulación
  graduationOptions: GraduationOption[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Opción de titulación actual (detalle)
  currentGraduationOption: GraduationOption | null;
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

const initialState: GraduationOptionsState = {
  graduationOptions: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentGraduationOption: null,
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

const graduationOptionsSlice = createSlice({
  name: 'graduationOptions',
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
    clearCurrentGraduationOption: (state) => {
      state.currentGraduationOption = null;
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
    builder.addCase(listGraduationOptionsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listGraduationOptionsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.graduationOptions = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listGraduationOptionsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al obtener lista de opciones de titulación';
    });

    // ========== GET BY ID ==========
    builder.addCase(getGraduationOptionByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(
      getGraduationOptionByIdThunk.fulfilled,
      (state, action) => {
        state.isLoadingDetail = false;
        state.currentGraduationOption = action.payload;
        state.detailError = null;
      }
    );
    builder.addCase(getGraduationOptionByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError =
        action.payload || 'Error al obtener opción de titulación';
    });

    // ========== CREATE ==========
    builder.addCase(createGraduationOptionThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createGraduationOptionThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar la nueva opción al inicio de la lista
      state.graduationOptions.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createGraduationOptionThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError =
        action.payload || 'Error al crear opción de titulación';
    });

    // ========== UPDATE ==========
    builder.addCase(updateGraduationOptionThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateGraduationOptionThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.graduationOptions.findIndex(
        (opt) => opt.id === action.payload.id
      );
      if (index !== -1) {
        state.graduationOptions[index] = action.payload;
      }
      // Actualizar opción actual si es la misma
      if (
        state.currentGraduationOption &&
        state.currentGraduationOption.id === action.payload.id
      ) {
        state.currentGraduationOption = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateGraduationOptionThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError =
        action.payload || 'Error al actualizar opción de titulación';
    });

    // ========== PATCH ==========
    builder.addCase(patchGraduationOptionThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchGraduationOptionThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.graduationOptions.findIndex(
        (opt) => opt.id === action.payload.id
      );
      if (index !== -1) {
        state.graduationOptions[index] = action.payload;
      }
      // Actualizar opción actual si es la misma
      if (
        state.currentGraduationOption &&
        state.currentGraduationOption.id === action.payload.id
      ) {
        state.currentGraduationOption = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchGraduationOptionThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError =
        action.payload || 'Error al actualizar opción de titulación';
    });

    // ========== DELETE ==========
    builder.addCase(deleteGraduationOptionThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteGraduationOptionThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.graduationOptions = state.graduationOptions.filter(
        (opt) => opt.id !== action.payload
      );
      // Limpiar opción actual si es la eliminada
      if (
        state.currentGraduationOption &&
        state.currentGraduationOption.id === action.payload
      ) {
        state.currentGraduationOption = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteGraduationOptionThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError =
        action.payload || 'Error al eliminar opción de titulación';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateGraduationOptionThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(
      activateGraduationOptionThunk.fulfilled,
      (state, action) => {
        state.isActivating = false;
        // Actualizar en la lista
        const index = state.graduationOptions.findIndex(
          (opt) => opt.id === action.payload.id
        );
        if (index !== -1) {
          state.graduationOptions[index] = action.payload;
        }
        // Actualizar opción actual si es la misma
        if (
          state.currentGraduationOption &&
          state.currentGraduationOption.id === action.payload.id
        ) {
          state.currentGraduationOption = action.payload;
        }
        state.activateError = null;
      }
    );
    builder.addCase(activateGraduationOptionThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError =
        action.payload || 'Error al activar opción de titulación';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateGraduationOptionThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(
      deactivateGraduationOptionThunk.fulfilled,
      (state, action) => {
        state.isDeactivating = false;
        // Actualizar en la lista
        const index = state.graduationOptions.findIndex(
          (opt) => opt.id === action.payload.id
        );
        if (index !== -1) {
          state.graduationOptions[index] = action.payload;
        }
        // Actualizar opción actual si es la misma
        if (
          state.currentGraduationOption &&
          state.currentGraduationOption.id === action.payload.id
        ) {
          state.currentGraduationOption = action.payload;
        }
        state.deactivateError = null;
      }
    );
    builder.addCase(
      deactivateGraduationOptionThunk.rejected,
      (state, action) => {
        state.isDeactivating = false;
        state.deactivateError =
          action.payload || 'Error al desactivar opción de titulación';
      }
    );
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentGraduationOption,
  clearAllErrors,
} = graduationOptionsSlice.actions;

export const graduationOptionsReducer =
  graduationOptionsSlice.reducer;
