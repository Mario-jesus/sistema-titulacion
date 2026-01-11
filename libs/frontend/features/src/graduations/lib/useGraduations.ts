import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { Graduation } from '@entities/graduation';
import type {
  CreateGraduationRequest,
  UpdateGraduationRequest,
} from '../model/types';
import {
  getGraduationByIdThunk,
  createGraduationThunk,
  updateGraduationThunk,
  patchGraduationThunk,
  deleteGraduationThunk,
  graduateStudentThunk,
  ungraduateStudentThunk,
} from '../model/graduationsThunks';
import {
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearGraduateError,
  clearUngraduateError,
  clearCurrentGraduation,
  clearAllErrors,
  type GraduationsState,
} from '../model/graduationsSlice';

interface AppState extends BaseAppState {
  graduations: GraduationsState;
}

export function useGraduations() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const currentGraduation = useSelector(
    (state: AppState) => state.graduations.currentGraduation
  );

  // Estados de carga
  const isLoadingDetail = useSelector(
    (state: AppState) => state.graduations.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.graduations.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.graduations.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.graduations.isDeleting
  );
  const isGraduating = useSelector(
    (state: AppState) => state.graduations.isGraduating
  );
  const isUngraduating = useSelector(
    (state: AppState) => state.graduations.isUngraduating
  );

  // Errores
  const detailError = useSelector(
    (state: AppState) => state.graduations.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.graduations.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.graduations.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.graduations.deleteError
  );
  const graduateError = useSelector(
    (state: AppState) => state.graduations.graduateError
  );
  const ungraduateError = useSelector(
    (state: AppState) => state.graduations.ungraduateError
  );

  // ========== ACTIONS ==========
  const getGraduationById = useCallback(
    async (id: string): Promise<Result<Graduation>> => {
      const result = await dispatch(getGraduationByIdThunk(id));

      if (getGraduationByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener titulación',
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

  const createGraduation = useCallback(
    async (data: CreateGraduationRequest): Promise<Result<Graduation>> => {
      const result = await dispatch(createGraduationThunk(data));

      if (createGraduationThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear titulación',
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

  const updateGraduation = useCallback(
    async (
      id: string,
      data: UpdateGraduationRequest
    ): Promise<Result<Graduation>> => {
      const result = await dispatch(updateGraduationThunk({ id, data }));

      if (updateGraduationThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar titulación',
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

  const patchGraduation = useCallback(
    async (
      id: string,
      data: Partial<UpdateGraduationRequest>
    ): Promise<Result<Graduation>> => {
      const result = await dispatch(patchGraduationThunk({ id, data }));

      if (patchGraduationThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar titulación',
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

  const deleteGraduation = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteGraduationThunk(id));

      if (deleteGraduationThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar titulación',
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

  const graduateStudent = useCallback(
    async (studentId: string): Promise<Result<Graduation>> => {
      const result = await dispatch(graduateStudentThunk(studentId));

      if (graduateStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al marcar estudiante como titulado',
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

  const ungraduateStudent = useCallback(
    async (studentId: string): Promise<Result<Graduation>> => {
      const result = await dispatch(ungraduateStudentThunk(studentId));

      if (ungraduateStudentThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload || 'Error al desmarcar estudiante como titulado',
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

  // ========== ERROR CLEARERS ==========
  const clearErrors = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  const clearDetailErr = useCallback(() => {
    dispatch(clearDetailError());
  }, [dispatch]);

  const clearCreateErr = useCallback(() => {
    dispatch(clearCreateError());
  }, [dispatch]);

  const clearUpdateErr = useCallback(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  const clearDeleteErr = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  const clearGraduateErr = useCallback(() => {
    dispatch(clearGraduateError());
  }, [dispatch]);

  const clearUngraduateErr = useCallback(() => {
    dispatch(clearUngraduateError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentGraduation());
  }, [dispatch]);

  return {
    // Estado
    currentGraduation,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    isGraduating,
    isUngraduating,
    detailError,
    createError,
    updateError,
    deleteError,
    graduateError,
    ungraduateError,

    // Acciones
    getGraduationById,
    createGraduation,
    updateGraduation,
    patchGraduation,
    deleteGraduation,
    graduateStudent,
    ungraduateStudent,

    // Limpiar errores
    clearErrors,
    clearDetailErr,
    clearCreateErr,
    clearUpdateErr,
    clearDeleteErr,
    clearGraduateErr,
    clearUngraduateErr,
    clearCurrent,
  };
}
