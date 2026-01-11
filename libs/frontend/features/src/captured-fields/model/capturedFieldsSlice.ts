import { createSlice } from '@reduxjs/toolkit';
import type { CapturedFields } from '@entities/captured-fields';
import {
  getCapturedFieldsByIdThunk,
  createCapturedFieldsThunk,
  updateCapturedFieldsThunk,
  patchCapturedFieldsThunk,
  deleteCapturedFieldsThunk,
} from './capturedFieldsThunks';

export interface CapturedFieldsState {
  // Campos capturados actuales (detalle)
  currentCapturedFields: CapturedFields | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  isDeleting: boolean;
  deleteError: string | null;
}

const initialState: CapturedFieldsState = {
  currentCapturedFields: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  isDeleting: false,
  deleteError: null,
};

const capturedFieldsSlice = createSlice({
  name: 'capturedFields',
  initialState,
  reducers: {
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
    clearCurrentCapturedFields: (state) => {
      state.currentCapturedFields = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== GET BY ID ==========
    builder.addCase(getCapturedFieldsByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getCapturedFieldsByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentCapturedFields = action.payload;
      state.detailError = null;
    });
    builder.addCase(getCapturedFieldsByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError =
        action.payload || 'Error al obtener campos capturados';
    });

    // ========== CREATE ==========
    builder.addCase(createCapturedFieldsThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createCapturedFieldsThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Actualizar campos capturados actuales si se está creando para el mismo estudiante
      state.currentCapturedFields = action.payload;
      state.createError = null;
    });
    builder.addCase(createCapturedFieldsThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear campos capturados';
    });

    // ========== UPDATE ==========
    builder.addCase(updateCapturedFieldsThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateCapturedFieldsThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar campos capturados actuales si es el mismo
      if (
        state.currentCapturedFields &&
        state.currentCapturedFields.id === action.payload.id
      ) {
        state.currentCapturedFields = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateCapturedFieldsThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError =
        action.payload || 'Error al actualizar campos capturados';
    });

    // ========== PATCH ==========
    builder.addCase(patchCapturedFieldsThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchCapturedFieldsThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar campos capturados actuales si es el mismo
      if (
        state.currentCapturedFields &&
        state.currentCapturedFields.id === action.payload.id
      ) {
        state.currentCapturedFields = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchCapturedFieldsThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError =
        action.payload || 'Error al actualizar campos capturados';
    });

    // ========== DELETE ==========
    builder.addCase(deleteCapturedFieldsThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteCapturedFieldsThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Limpiar campos capturados actuales si se eliminaron
      if (
        state.currentCapturedFields &&
        state.currentCapturedFields.id === action.payload
      ) {
        state.currentCapturedFields = null;
      }
      state.deleteError = null;
    });
    builder.addCase(deleteCapturedFieldsThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError =
        action.payload || 'Error al eliminar campos capturados';
    });
  },
});

export const {
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentCapturedFields,
  clearAllErrors,
} = capturedFieldsSlice.actions;

export const capturedFieldsReducer = capturedFieldsSlice.reducer;
