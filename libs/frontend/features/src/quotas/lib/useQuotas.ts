import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { Quota } from '@entities/quota';
import type {
  ListQuotasParams,
  ListQuotasResponse,
  CreateQuotaRequest,
  UpdateQuotaRequest,
} from '../model/types';
import {
  listQuotasThunk,
  getQuotaByIdThunk,
  createQuotaThunk,
  updateQuotaThunk,
  patchQuotaThunk,
  deleteQuotaThunk,
  activateQuotaThunk,
  deactivateQuotaThunk,
} from '../model/quotasThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentQuota,
  clearAllErrors,
  type QuotasState,
} from '../model/quotasSlice';

interface AppState extends BaseAppState {
  quotas: QuotasState;
}

export function useQuotas() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const quotas = useSelector((state: AppState) => state.quotas.quotas);
  const pagination = useSelector((state: AppState) => state.quotas.pagination);
  const currentQuota = useSelector(
    (state: AppState) => state.quotas.currentQuota
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.quotas.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.quotas.isLoadingDetail
  );
  const isCreating = useSelector((state: AppState) => state.quotas.isCreating);
  const isUpdating = useSelector((state: AppState) => state.quotas.isUpdating);
  const isDeleting = useSelector((state: AppState) => state.quotas.isDeleting);
  const isActivating = useSelector(
    (state: AppState) => state.quotas.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.quotas.isDeactivating
  );

  // Errores
  const listError = useSelector((state: AppState) => state.quotas.listError);
  const detailError = useSelector(
    (state: AppState) => state.quotas.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.quotas.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.quotas.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.quotas.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.quotas.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.quotas.deactivateError
  );

  // ========== ACTIONS ==========
  const listQuotas = useCallback(
    async (params?: ListQuotasParams): Promise<Result<ListQuotasResponse>> => {
      const result = await dispatch(listQuotasThunk(params));

      if (listQuotasThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener lista de cupos',
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

  const getQuotaById = useCallback(
    async (id: string): Promise<Result<Quota>> => {
      const result = await dispatch(getQuotaByIdThunk(id));

      if (getQuotaByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener cupo',
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

  const createQuota = useCallback(
    async (data: CreateQuotaRequest): Promise<Result<Quota>> => {
      const result = await dispatch(createQuotaThunk(data));

      if (createQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear cupo',
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

  const updateQuota = useCallback(
    async (id: string, data: UpdateQuotaRequest): Promise<Result<Quota>> => {
      const result = await dispatch(updateQuotaThunk({ id, data }));

      if (updateQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar cupo',
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

  const patchQuota = useCallback(
    async (
      id: string,
      data: Partial<UpdateQuotaRequest>
    ): Promise<Result<Quota>> => {
      const result = await dispatch(patchQuotaThunk({ id, data }));

      if (patchQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar cupo',
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

  const deleteQuota = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteQuotaThunk(id));

      if (deleteQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar cupo',
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

  const activateQuota = useCallback(
    async (id: string): Promise<Result<Quota>> => {
      const result = await dispatch(activateQuotaThunk(id));

      if (activateQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al activar cupo',
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

  const deactivateQuota = useCallback(
    async (id: string): Promise<Result<Quota>> => {
      const result = await dispatch(deactivateQuotaThunk(id));

      if (deactivateQuotaThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al desactivar cupo',
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
    dispatch(clearCurrentQuota());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    quotas,
    pagination,
    currentQuota,

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
    listQuotas,
    getQuotaById,
    createQuota,
    updateQuota,
    patchQuota,
    deleteQuota,
    activateQuota,
    deactivateQuota,

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
