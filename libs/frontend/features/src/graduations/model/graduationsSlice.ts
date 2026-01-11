import { createSlice } from '@reduxjs/toolkit';
import type { Graduation } from '@entities/graduation';
import {
  getGraduationByIdThunk,
  createGraduationThunk,
  updateGraduationThunk,
  patchGraduationThunk,
  deleteGraduationThunk,
  graduateStudentThunk,
  ungraduateStudentThunk,
} from './graduationsThunks';

export interface GraduationsState {
  // Titulación actual (detalle)
  currentGraduation: Graduation | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  isDeleting: boolean;
  deleteError: string | null;

  // Operaciones especiales
  isGraduating: boolean;
  graduateError: string | null;

  isUngraduating: boolean;
  ungraduateError: string | null;
}

const initialState: GraduationsState = {
  currentGraduation: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  isDeleting: false,
  deleteError: null,

  isGraduating: false,
  graduateError: null,

  isUngraduating: false,
  ungraduateError: null,
};

const graduationsSlice = createSlice({
  name: 'graduations',
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
    clearGraduateError: (state) => {
      state.graduateError = null;
    },
    clearUngraduateError: (state) => {
      state.ungraduateError = null;
    },
    clearCurrentGraduation: (state) => {
      state.currentGraduation = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.graduateError = null;
      state.ungraduateError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== GET BY ID ==========
    builder.addCase(getGraduationByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getGraduationByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentGraduation = action.payload;
      state.detailError = null;
    });
    builder.addCase(getGraduationByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener titulación';
    });

    // ========== CREATE ==========
    builder.addCase(createGraduationThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createGraduationThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Actualizar titulación actual si se está creando para el mismo estudiante
      state.currentGraduation = action.payload;
      state.createError = null;
    });
    builder.addCase(createGraduationThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear titulación';
    });

    // ========== UPDATE ==========
    builder.addCase(updateGraduationThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateGraduationThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar titulación actual si es la misma
      if (
        state.currentGraduation &&
        state.currentGraduation.id === action.payload.id
      ) {
        state.currentGraduation = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateGraduationThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar titulación';
    });

    // ========== PATCH ==========
    builder.addCase(patchGraduationThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchGraduationThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar titulación actual si es la misma
      if (
        state.currentGraduation &&
        state.currentGraduation.id === action.payload.id
      ) {
        state.currentGraduation = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchGraduationThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar titulación';
    });

    // ========== DELETE ==========
    builder.addCase(deleteGraduationThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteGraduationThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Limpiar titulación actual si se eliminó
      if (
        state.currentGraduation &&
        state.currentGraduation.id === action.payload
      ) {
        state.currentGraduation = null;
      }
      state.deleteError = null;
    });
    builder.addCase(deleteGraduationThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar titulación';
    });

    // ========== GRADUATE ==========
    builder.addCase(graduateStudentThunk.pending, (state) => {
      state.isGraduating = true;
      state.graduateError = null;
    });
    builder.addCase(graduateStudentThunk.fulfilled, (state, action) => {
      state.isGraduating = false;
      // Actualizar titulación actual si es la misma
      if (
        state.currentGraduation &&
        state.currentGraduation.studentId === action.payload.studentId
      ) {
        state.currentGraduation = action.payload;
      }
      state.graduateError = null;
    });
    builder.addCase(graduateStudentThunk.rejected, (state, action) => {
      state.isGraduating = false;
      state.graduateError =
        action.payload || 'Error al marcar estudiante como titulado';
    });

    // ========== UNGRADUATE ==========
    builder.addCase(ungraduateStudentThunk.pending, (state) => {
      state.isUngraduating = true;
      state.ungraduateError = null;
    });
    builder.addCase(ungraduateStudentThunk.fulfilled, (state, action) => {
      state.isUngraduating = false;
      // Actualizar titulación actual si es la misma
      if (
        state.currentGraduation &&
        state.currentGraduation.studentId === action.payload.studentId
      ) {
        state.currentGraduation = action.payload;
      }
      state.ungraduateError = null;
    });
    builder.addCase(ungraduateStudentThunk.rejected, (state, action) => {
      state.isUngraduating = false;
      state.ungraduateError =
        action.payload || 'Error al desmarcar estudiante como titulado';
    });
  },
});

export const {
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearGraduateError,
  clearUngraduateError,
  clearCurrentGraduation,
  clearAllErrors,
} = graduationsSlice.actions;

export const graduationsReducer = graduationsSlice.reducer;
