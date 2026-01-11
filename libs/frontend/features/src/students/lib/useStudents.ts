import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { StudentStatus } from '@entities/student';
import type {
  ListStudentsParams,
  CreateStudentRequest,
  UpdateStudentRequest,
} from '../model/types';
import {
  listStudentsThunk,
  getStudentByIdThunk,
  createStudentThunk,
  updateStudentThunk,
  patchStudentThunk,
  deleteStudentThunk,
  changeStudentStatusThunk,
} from '../model/studentsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearChangeStatusError,
  clearCurrentStudent,
  clearAllErrors,
  type StudentsState,
} from '../model/studentsSlice';

interface AppState extends BaseAppState {
  students: StudentsState;
}

export function useStudents() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const students = useSelector((state: AppState) => state.students.students);
  const pagination = useSelector(
    (state: AppState) => state.students.pagination
  );
  const currentStudent = useSelector(
    (state: AppState) => state.students.currentStudent
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.students.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.students.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.students.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.students.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.students.isDeleting
  );
  const isChangingStatus = useSelector(
    (state: AppState) => state.students.isChangingStatus
  );

  // Errores
  const listError = useSelector((state: AppState) => state.students.listError);
  const detailError = useSelector(
    (state: AppState) => state.students.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.students.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.students.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.students.deleteError
  );
  const changeStatusError = useSelector(
    (state: AppState) => state.students.changeStatusError
  );

  // ========== ACTIONS ==========
  const listStudents = useCallback(
    async (params?: ListStudentsParams) => {
      const result = await dispatch(listStudentsThunk(params));

      if (listStudentsThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al obtener lista de estudiantes'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  const getStudentById = useCallback(
    async (id: string) => {
      const result = await dispatch(getStudentByIdThunk(id));

      if (getStudentByIdThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al obtener estudiante');
      }

      return result.payload;
    },
    [dispatch]
  );

  const createStudent = useCallback(
    async (data: CreateStudentRequest) => {
      const result = await dispatch(createStudentThunk(data));

      if (createStudentThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al crear estudiante');
      }

      return result.payload;
    },
    [dispatch]
  );

  const updateStudent = useCallback(
    async (id: string, data: UpdateStudentRequest) => {
      const result = await dispatch(updateStudentThunk({ id, data }));

      if (updateStudentThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar estudiante');
      }

      return result.payload;
    },
    [dispatch]
  );

  const patchStudent = useCallback(
    async (id: string, data: Partial<UpdateStudentRequest>) => {
      const result = await dispatch(patchStudentThunk({ id, data }));

      if (patchStudentThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar estudiante');
      }

      return result.payload;
    },
    [dispatch]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteStudentThunk(id));

      if (deleteStudentThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al eliminar estudiante');
      }
    },
    [dispatch]
  );

  const changeStudentStatus = useCallback(
    async (id: string, status: StudentStatus) => {
      const result = await dispatch(changeStudentStatusThunk({ id, status }));

      if (changeStudentStatusThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al cambiar estado del estudiante'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  // ========== CLEAR ACTIONS ==========
  const clearErrors = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  const clearListErrors = useCallback(() => {
    dispatch(clearListError());
  }, [dispatch]);

  const clearDetailErrors = useCallback(() => {
    dispatch(clearDetailError());
  }, [dispatch]);

  const clearCreateErrors = useCallback(() => {
    dispatch(clearCreateError());
  }, [dispatch]);

  const clearUpdateErrors = useCallback(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  const clearDeleteErrors = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  const clearChangeStatusErrors = useCallback(() => {
    dispatch(clearChangeStatusError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentStudent());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    students,
    pagination,
    currentStudent,

    // ========== LOADING STATES ==========
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    isChangingStatus,

    // ========== ERRORS ==========
    listError,
    detailError,
    createError,
    updateError,
    deleteError,
    changeStatusError,

    // ========== ACTIONS ==========
    listStudents,
    getStudentById,
    createStudent,
    updateStudent,
    patchStudent,
    deleteStudent,
    changeStudentStatus,

    // ========== CLEAR ACTIONS ==========
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearCreateErrors,
    clearUpdateErrors,
    clearDeleteErrors,
    clearChangeStatusErrors,
    clearCurrent,
  };
}
