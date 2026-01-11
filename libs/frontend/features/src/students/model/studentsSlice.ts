import { createSlice } from '@reduxjs/toolkit';
import type { Student } from '@entities/student';
import type { PaginationData } from '@shared/lib/model';
import {
  listStudentsThunk,
  getStudentByIdThunk,
  createStudentThunk,
  updateStudentThunk,
  patchStudentThunk,
  deleteStudentThunk,
  changeStudentStatusThunk,
} from './studentsThunks';

export interface StudentsState {
  // Lista de estudiantes
  students: Student[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Estudiante actual (detalle)
  currentStudent: Student | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Operaciones CRUD
  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  isDeleting: boolean;
  deleteError: string | null;

  isChangingStatus: boolean;
  changeStatusError: string | null;
}

const initialState: StudentsState = {
  students: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentStudent: null,
  isLoadingDetail: false,
  detailError: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  isDeleting: false,
  deleteError: null,

  isChangingStatus: false,
  changeStatusError: null,
};

const studentsSlice = createSlice({
  name: 'students',
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
    clearChangeStatusError: (state) => {
      state.changeStatusError = null;
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.changeStatusError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LIST ==========
    builder.addCase(listStudentsThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listStudentsThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.students = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listStudentsThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al obtener lista de estudiantes';
    });

    // ========== GET BY ID ==========
    builder.addCase(getStudentByIdThunk.pending, (state) => {
      state.isLoadingDetail = true;
      state.detailError = null;
    });
    builder.addCase(getStudentByIdThunk.fulfilled, (state, action) => {
      state.isLoadingDetail = false;
      state.currentStudent = action.payload;
      state.detailError = null;
    });
    builder.addCase(getStudentByIdThunk.rejected, (state, action) => {
      state.isLoadingDetail = false;
      state.detailError = action.payload || 'Error al obtener estudiante';
    });

    // ========== CREATE ==========
    builder.addCase(createStudentThunk.pending, (state) => {
      state.isCreating = true;
      state.createError = null;
    });
    builder.addCase(createStudentThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      // Agregar el nuevo estudiante al inicio de la lista
      state.students.unshift(action.payload);
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total += 1;
      }
      state.createError = null;
    });
    builder.addCase(createStudentThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.createError = action.payload || 'Error al crear estudiante';
    });

    // ========== UPDATE ==========
    builder.addCase(updateStudentThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(updateStudentThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.students.findIndex(
        (student) => student.id === action.payload.id
      );
      if (index !== -1) {
        state.students[index] = action.payload;
      }
      // Actualizar estudiante actual si es el mismo
      if (
        state.currentStudent &&
        state.currentStudent.id === action.payload.id
      ) {
        state.currentStudent = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(updateStudentThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar estudiante';
    });

    // ========== PATCH ==========
    builder.addCase(patchStudentThunk.pending, (state) => {
      state.isUpdating = true;
      state.updateError = null;
    });
    builder.addCase(patchStudentThunk.fulfilled, (state, action) => {
      state.isUpdating = false;
      // Actualizar en la lista
      const index = state.students.findIndex(
        (student) => student.id === action.payload.id
      );
      if (index !== -1) {
        state.students[index] = action.payload;
      }
      // Actualizar estudiante actual si es el mismo
      if (
        state.currentStudent &&
        state.currentStudent.id === action.payload.id
      ) {
        state.currentStudent = action.payload;
      }
      state.updateError = null;
    });
    builder.addCase(patchStudentThunk.rejected, (state, action) => {
      state.isUpdating = false;
      state.updateError = action.payload || 'Error al actualizar estudiante';
    });

    // ========== DELETE ==========
    builder.addCase(deleteStudentThunk.pending, (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    });
    builder.addCase(deleteStudentThunk.fulfilled, (state, action) => {
      state.isDeleting = false;
      // Remover de la lista
      state.students = state.students.filter(
        (student) => student.id !== action.payload
      );
      // Limpiar estudiante actual si es el eliminado
      if (state.currentStudent && state.currentStudent.id === action.payload) {
        state.currentStudent = null;
      }
      // Actualizar el total en paginación si existe
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
      state.deleteError = null;
    });
    builder.addCase(deleteStudentThunk.rejected, (state, action) => {
      state.isDeleting = false;
      state.deleteError = action.payload || 'Error al eliminar estudiante';
    });

    // ========== CHANGE STATUS ==========
    builder.addCase(changeStudentStatusThunk.pending, (state) => {
      state.isChangingStatus = true;
      state.changeStatusError = null;
    });
    builder.addCase(changeStudentStatusThunk.fulfilled, (state, action) => {
      state.isChangingStatus = false;
      // Actualizar en la lista
      const index = state.students.findIndex(
        (student) => student.id === action.payload.id
      );
      if (index !== -1) {
        state.students[index] = action.payload;
      }
      // Actualizar estudiante actual si es el mismo
      if (
        state.currentStudent &&
        state.currentStudent.id === action.payload.id
      ) {
        state.currentStudent = action.payload;
      }
      state.changeStatusError = null;
    });
    builder.addCase(changeStudentStatusThunk.rejected, (state, action) => {
      state.isChangingStatus = false;
      state.changeStatusError =
        action.payload || 'Error al cambiar estado del estudiante';
    });
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearChangeStatusError,
  clearCurrentStudent,
  clearAllErrors,
} = studentsSlice.actions;

export const studentsReducer = studentsSlice.reducer;
