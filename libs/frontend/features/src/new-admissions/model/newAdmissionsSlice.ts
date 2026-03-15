import { createSlice } from '@reduxjs/toolkit';
import type { NewAdmission } from '@entities/new-admission';
import type { PaginationData } from '@shared/lib/model';
import {
  listNewAdmissionsThunk,
  getNewAdmissionByIdThunk,
  createNewAdmissionThunk,
  updateNewAdmissionThunk,
  patchNewAdmissionThunk,
  deleteNewAdmissionThunk,
  activateNewAdmissionThunk,
  deactivateNewAdmissionThunk,
} from './newAdmissionsThunks';

export interface NewAdmissionsState {
  // Lista de registros de ingreso
  newAdmissions: NewAdmission[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Registro actual (detalle)
  currentNewAdmission: NewAdmission | null;
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

const initialState: NewAdmissionsState = {
  newAdmissions: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentNewAdmission: null,
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

const newAdmissionsSlice = createSlice({
  name: 'newAdmissions',
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
    clearCurrentNewAdmission: (state) => {
      state.currentNewAdmission = null;
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
    builder.addCase(listNewAdmissionsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listNewAdmissionsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.newAdmissions = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listNewAdmissionsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al cargar registros de ingreso';
    });

    // ========== GET BY ID ==========
    builder.addCase(getNewAdmissionByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getNewAdmissionByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentNewAdmission = action.payload;
      state.detailError = null;
    });
    builder.addCase(getNewAdmissionByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError =
        action.payload || 'Error al obtener registro de ingreso';
    });

    // ========== CREATE ==========
    builder.addCase(createNewAdmissionThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createNewAdmissionThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      state.newAdmissions.unshift(action.payload);
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createNewAdmissionThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear registro';
    });

    // ========== UPDATE ==========
    builder.addCase(updateNewAdmissionThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateNewAdmissionThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      const index = state.newAdmissions.findIndex(
        (entry) => entry.id === action.payload.id
      );
      if (index !== -1) {
        state.newAdmissions[index] = action.payload;
      }
      if (
        state.currentNewAdmission &&
        state.currentNewAdmission.id === action.payload.id
      ) {
        state.currentNewAdmission = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateNewAdmissionThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar registro';
    });

    // ========== PATCH ==========
    builder.addCase(patchNewAdmissionThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchNewAdmissionThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      const index = state.newAdmissions.findIndex(
        (entry) => entry.id === action.payload.id
      );
      if (index !== -1) {
        state.newAdmissions[index] = action.payload;
      }
      if (
        state.currentNewAdmission &&
        state.currentNewAdmission.id === action.payload.id
      ) {
        state.currentNewAdmission = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchNewAdmissionThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar registro';
    });

    // ========== DELETE ==========
    builder.addCase(deleteNewAdmissionThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteNewAdmissionThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      state.newAdmissions = state.newAdmissions.filter(
        (entry) => entry.id !== action.payload
      );
      if (
        state.currentNewAdmission &&
        state.currentNewAdmission.id === action.payload
      ) {
        state.currentNewAdmission = null;
      }
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteNewAdmissionThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar registro';
    });

    // ========== ACTIVATE ==========
    builder.addCase(activateNewAdmissionThunk.pending, (state) => {
      state.isActivating = true;
      state.activateError = null;
    });
    builder.addCase(activateNewAdmissionThunk.fulfilled, (state, action) => {
      state.isActivating = false;
      const index = state.newAdmissions.findIndex(
        (entry) => entry.id === action.payload.id
      );
      if (index !== -1) {
        state.newAdmissions[index] = action.payload;
      }
      if (
        state.currentNewAdmission &&
        state.currentNewAdmission.id === action.payload.id
      ) {
        state.currentNewAdmission = action.payload;
      }
      state.activateError = null;
    });
    builder.addCase(activateNewAdmissionThunk.rejected, (state, action) => {
      state.isActivating = false;
      state.activateError = action.payload || 'Error al activar registro';
    });

    // ========== DEACTIVATE ==========
    builder.addCase(deactivateNewAdmissionThunk.pending, (state) => {
      state.isDeactivating = true;
      state.deactivateError = null;
    });
    builder.addCase(deactivateNewAdmissionThunk.fulfilled, (state, action) => {
      state.isDeactivating = false;
      const index = state.newAdmissions.findIndex(
        (entry) => entry.id === action.payload.id
      );
      if (index !== -1) {
        state.newAdmissions[index] = action.payload;
      }
      if (
        state.currentNewAdmission &&
        state.currentNewAdmission.id === action.payload.id
      ) {
        state.currentNewAdmission = action.payload;
      }
      state.deactivateError = null;
    });
    builder.addCase(deactivateNewAdmissionThunk.rejected, (state, action) => {
      state.isDeactivating = false;
      state.deactivateError = action.payload || 'Error al desactivar registro';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentNewAdmission,
  clearAllErrors,
} = newAdmissionsSlice.actions;

export const newAdmissionsReducer = newAdmissionsSlice.reducer;
