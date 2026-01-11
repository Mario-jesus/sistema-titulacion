import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { StudentStatus } from '@entities/student';
import type {
  ListStudentsParams,
  ListStudentsResponse,
  ListInProgressStudentsParams,
  ListInProgressStudentsResponse,
  ListScheduledStudentsParams,
  ListScheduledStudentsResponse,
  ListGraduatedStudentsParams,
  ListGraduatedStudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
} from '../model/types';
import type { Student } from '@entities/student';

import {
  listStudentsThunk,
  getStudentByIdThunk,
  createStudentThunk,
  updateStudentThunk,
  patchStudentThunk,
  deleteStudentThunk,
  changeStudentStatusThunk,
  listInProgressStudentsThunk,
  listScheduledStudentsThunk,
  listGraduatedStudentsThunk,
  egressStudentThunk,
  unegressStudentThunk,
} from '../model/studentsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearChangeStatusError,
  clearInProgressError,
  clearScheduledError,
  clearGraduatedError,
  clearEgressError,
  clearUnegressError,
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

  // Listas especiales
  const inProgressStudents = useSelector(
    (state: AppState) => state.students.inProgressStudents
  );
  const inProgressPagination = useSelector(
    (state: AppState) => state.students.inProgressPagination
  );
  const scheduledStudents = useSelector(
    (state: AppState) => state.students.scheduledStudents
  );
  const scheduledPagination = useSelector(
    (state: AppState) => state.students.scheduledPagination
  );
  const graduatedStudents = useSelector(
    (state: AppState) => state.students.graduatedStudents
  );
  const graduatedPagination = useSelector(
    (state: AppState) => state.students.graduatedPagination
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.students.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.students.isLoadingDetail
  );
  const isLoadingInProgress = useSelector(
    (state: AppState) => state.students.isLoadingInProgress
  );
  const isLoadingScheduled = useSelector(
    (state: AppState) => state.students.isLoadingScheduled
  );
  const isLoadingGraduated = useSelector(
    (state: AppState) => state.students.isLoadingGraduated
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
  const inProgressError = useSelector(
    (state: AppState) => state.students.inProgressError
  );
  const scheduledError = useSelector(
    (state: AppState) => state.students.scheduledError
  );
  const graduatedError = useSelector(
    (state: AppState) => state.students.graduatedError
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

  const isEgressing = useSelector(
    (state: AppState) => state.students.isEgressing
  );

  const egressError = useSelector(
    (state: AppState) => state.students.egressError
  );

  const isUnegressing = useSelector(
    (state: AppState) => state.students.isUnegressing
  );

  const unegressError = useSelector(
    (state: AppState) => state.students.unegressError
  );

  // ========== ACTIONS ==========
  const listStudents = useCallback(
    async (
      params?: ListStudentsParams
    ): Promise<Result<ListStudentsResponse>> => {
      const result = await dispatch(listStudentsThunk(params));

      if (listStudentsThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener lista de estudiantes',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const getStudentById = useCallback(
    async (id: string): Promise<Result<Student>> => {
      const result = await dispatch(getStudentByIdThunk(id));

      if (getStudentByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const createStudent = useCallback(
    async (data: CreateStudentRequest): Promise<Result<Student>> => {
      const result = await dispatch(createStudentThunk(data));

      if (createStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const updateStudent = useCallback(
    async (
      id: string,
      data: UpdateStudentRequest
    ): Promise<Result<Student>> => {
      const result = await dispatch(updateStudentThunk({ id, data }));

      if (updateStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const patchStudent = useCallback(
    async (
      id: string,
      data: Partial<UpdateStudentRequest>
    ): Promise<Result<Student>> => {
      const result = await dispatch(patchStudentThunk({ id, data }));

      if (patchStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  const deleteStudent = useCallback(
    async (id: string): Promise<Result<void>> => {
      const result = await dispatch(deleteStudentThunk(id));

      if (deleteStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: undefined,
      };
    },
    [dispatch]
  );

  const changeStudentStatus = useCallback(
    async (id: string, status: StudentStatus): Promise<Result<Student>> => {
      const result = await dispatch(changeStudentStatusThunk({ id, status }));

      if (changeStudentStatusThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al cambiar estado del estudiante',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  // ========== EGRESS ==========
  const egressStudent = useCallback(
    async (studentId: string): Promise<Result<Student>> => {
      const result = await dispatch(egressStudentThunk(studentId));

      if (egressStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al marcar estudiante como egresado',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  // ========== UNEGRESS ==========
  const unegressStudent = useCallback(
    async (studentId: string): Promise<Result<Student>> => {
      const result = await dispatch(unegressStudentThunk(studentId));

      if (unegressStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload || 'Error al marcar estudiante como no egresado',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  // ========== LIST IN PROGRESS ==========
  const listInProgressStudents = useCallback(
    async (
      params?: ListInProgressStudentsParams
    ): Promise<Result<ListInProgressStudentsResponse>> => {
      const result = await dispatch(listInProgressStudentsThunk(params));

      if (listInProgressStudentsThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload ||
            'Error al obtener lista de estudiantes en proceso',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  // ========== LIST SCHEDULED ==========
  const listScheduledStudents = useCallback(
    async (
      params?: ListScheduledStudentsParams
    ): Promise<Result<ListScheduledStudentsResponse>> => {
      const result = await dispatch(listScheduledStudentsThunk(params));

      if (listScheduledStudentsThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload ||
            'Error al obtener lista de estudiantes programados',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
    },
    [dispatch]
  );

  // ========== LIST GRADUATED ==========
  const listGraduatedStudents = useCallback(
    async (
      params?: ListGraduatedStudentsParams
    ): Promise<Result<ListGraduatedStudentsResponse>> => {
      const result = await dispatch(listGraduatedStudentsThunk(params));

      if (listGraduatedStudentsThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload || 'Error al obtener lista de estudiantes titulados',
          code: extractErrorCode(result.payload),
        };
      }

      return {
        success: true,
        data: result.payload,
      };
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

  const clearInProgressErrors = useCallback(() => {
    dispatch(clearInProgressError());
  }, [dispatch]);

  const clearScheduledErrors = useCallback(() => {
    dispatch(clearScheduledError());
  }, [dispatch]);

  const clearGraduatedErrors = useCallback(() => {
    dispatch(clearGraduatedError());
  }, [dispatch]);

  const clearEgressErrors = useCallback(() => {
    dispatch(clearEgressError());
  }, [dispatch]);

  const clearUnegressErrors = useCallback(() => {
    dispatch(clearUnegressError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentStudent());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    students,
    pagination,
    currentStudent,
    inProgressStudents,
    inProgressPagination,
    scheduledStudents,
    scheduledPagination,
    graduatedStudents,
    graduatedPagination,

    // ========== LOADING STATES ==========
    isLoadingList,
    isLoadingDetail,
    isLoadingInProgress,
    isLoadingScheduled,
    isLoadingGraduated,
    isCreating,
    isUpdating,
    isDeleting,
    isChangingStatus,
    isEgressing,
    isUnegressing,

    // ========== ERRORS ==========
    listError,
    detailError,
    inProgressError,
    scheduledError,
    graduatedError,
    createError,
    updateError,
    deleteError,
    changeStatusError,
    egressError,
    unegressError,

    // ========== ACTIONS ==========
    listStudents,
    getStudentById,
    createStudent,
    updateStudent,
    patchStudent,
    deleteStudent,
    changeStudentStatus,
    egressStudent,
    unegressStudent,
    listInProgressStudents,
    listScheduledStudents,
    listGraduatedStudents,

    // ========== CLEAR ACTIONS ==========
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearInProgressErrors,
    clearScheduledErrors,
    clearGraduatedErrors,
    clearCreateErrors,
    clearUpdateErrors,
    clearDeleteErrors,
    clearChangeStatusErrors,
    clearEgressErrors,
    clearUnegressErrors,
    clearCurrent,
  };
}
