import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { GraduationOption } from '@entities/graduation-option';
import type {
  ListGraduationOptionsParams,
  ListGraduationOptionsResponse,
  CreateGraduationOptionRequest,
  UpdateGraduationOptionRequest,
} from '../model/types';
import {
  listGraduationOptionsThunk,
  getGraduationOptionByIdThunk,
  createGraduationOptionThunk,
  updateGraduationOptionThunk,
  patchGraduationOptionThunk,
  deleteGraduationOptionThunk,
  activateGraduationOptionThunk,
  deactivateGraduationOptionThunk,
} from '../model/graduationOptionsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentGraduationOption,
  clearAllErrors,
  type GraduationOptionsState,
} from '../model/graduationOptionsSlice';

interface AppState extends BaseAppState {
  graduationOptions: GraduationOptionsState;
}

export function useGraduationOptions() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const graduationOptions = useSelector(
    (state: AppState) => state.graduationOptions.graduationOptions
  );
  const pagination = useSelector(
    (state: AppState) => state.graduationOptions.pagination
  );
  const currentGraduationOption = useSelector(
    (state: AppState) => state.graduationOptions.currentGraduationOption
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.graduationOptions.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.graduationOptions.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.graduationOptions.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.graduationOptions.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.graduationOptions.isDeleting
  );
  const isActivating = useSelector(
    (state: AppState) => state.graduationOptions.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.graduationOptions.isDeactivating
  );

  // Errores
  const listError = useSelector(
    (state: AppState) => state.graduationOptions.listError
  );
  const detailError = useSelector(
    (state: AppState) => state.graduationOptions.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.graduationOptions.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.graduationOptions.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.graduationOptions.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.graduationOptions.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.graduationOptions.deactivateError
  );

  // ========== ACTIONS ==========
  const listGraduationOptions = useCallback(
    async (
      params?: ListGraduationOptionsParams
    ): Promise<Result<ListGraduationOptionsResponse>> => {
      const result = await dispatch(listGraduationOptionsThunk(params));

      if (listGraduationOptionsThunk.rejected.match(result)) {
        return {
          success: false,
          error:
            result.payload ||
            'Error al obtener lista de opciones de titulación',
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

  const getGraduationOptionById = useCallback(
    async (id: string): Promise<Result<GraduationOption>> => {
      const result = await dispatch(getGraduationOptionByIdThunk(id));

      if (getGraduationOptionByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener opción de titulación',
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

  const createGraduationOption = useCallback(
    async (
      data: CreateGraduationOptionRequest
    ): Promise<Result<GraduationOption>> => {
      const result = await dispatch(createGraduationOptionThunk(data));

      if (createGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear opción de titulación',
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

  const updateGraduationOption = useCallback(
    async (
      id: string,
      data: UpdateGraduationOptionRequest
    ): Promise<Result<GraduationOption>> => {
      const result = await dispatch(updateGraduationOptionThunk({ id, data }));

      if (updateGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar opción de titulación',
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

  const patchGraduationOption = useCallback(
    async (
      id: string,
      data: Partial<UpdateGraduationOptionRequest>
    ): Promise<Result<GraduationOption>> => {
      const result = await dispatch(patchGraduationOptionThunk({ id, data }));

      if (patchGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar opción de titulación',
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

  const deleteGraduationOption = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteGraduationOptionThunk(id));

      if (deleteGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar opción de titulación',
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

  const activateGraduationOption = useCallback(
    async (id: string): Promise<Result<GraduationOption>> => {
      const result = await dispatch(activateGraduationOptionThunk(id));

      if (activateGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al activar opción de titulación',
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

  const deactivateGraduationOption = useCallback(
    async (id: string): Promise<Result<GraduationOption>> => {
      const result = await dispatch(deactivateGraduationOptionThunk(id));

      if (deactivateGraduationOptionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al desactivar opción de titulación',
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

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentGraduationOption());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    graduationOptions,
    pagination,
    currentGraduationOption,

    // ========== LOADING STATES ==========
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    isActivating,
    isDeactivating,

    // ========== ERRORS ==========
    listError,
    detailError,
    createError,
    updateError,
    deleteError,
    activateError,
    deactivateError,

    // ========== ACTIONS ==========
    listGraduationOptions,
    getGraduationOptionById,
    createGraduationOption,
    updateGraduationOption,
    patchGraduationOption,
    deleteGraduationOption,
    activateGraduationOption,
    deactivateGraduationOption,

    // ========== CLEAR ACTIONS ==========
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearCreateErrors,
    clearUpdateErrors,
    clearDeleteErrors,
    clearCurrent,
  };
}
