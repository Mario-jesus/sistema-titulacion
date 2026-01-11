import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { Career } from '@entities/career';
import type {
  ListCareersParams,
  ListCareersResponse,
  CreateCareerRequest,
  UpdateCareerRequest,
} from '../model/types';
import {
  listCareersThunk,
  getCareerByIdThunk,
  createCareerThunk,
  updateCareerThunk,
  patchCareerThunk,
  deleteCareerThunk,
  activateCareerThunk,
  deactivateCareerThunk,
} from '../model/careersThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentCareer,
  clearAllErrors,
  type CareersState,
} from '../model/careersSlice';

interface AppState extends BaseAppState {
  careers: CareersState;
}

export function useCareers() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const careers = useSelector((state: AppState) => state.careers.careers);
  const pagination = useSelector((state: AppState) => state.careers.pagination);
  const currentCareer = useSelector(
    (state: AppState) => state.careers.currentCareer
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.careers.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.careers.isLoadingDetail
  );
  const isCreating = useSelector((state: AppState) => state.careers.isCreating);
  const isUpdating = useSelector((state: AppState) => state.careers.isUpdating);
  const isDeleting = useSelector((state: AppState) => state.careers.isDeleting);
  const isActivating = useSelector(
    (state: AppState) => state.careers.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.careers.isDeactivating
  );

  // Errores
  const listError = useSelector((state: AppState) => state.careers.listError);
  const detailError = useSelector(
    (state: AppState) => state.careers.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.careers.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.careers.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.careers.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.careers.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.careers.deactivateError
  );

  // ========== ACTIONS ==========
  const listCareers = useCallback(
    async (
      params?: ListCareersParams
    ): Promise<Result<ListCareersResponse>> => {
      const result = await dispatch(listCareersThunk(params));

      if (listCareersThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener lista de carreras',
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

  const getCareerById = useCallback(
    async (id: string): Promise<Result<Career>> => {
      const result = await dispatch(getCareerByIdThunk(id));

      if (getCareerByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener carrera',
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

  const createCareer = useCallback(
    async (data: CreateCareerRequest): Promise<Result<Career>> => {
      const result = await dispatch(createCareerThunk(data));

      if (createCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear carrera',
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

  const updateCareer = useCallback(
    async (id: string, data: UpdateCareerRequest): Promise<Result<Career>> => {
      const result = await dispatch(updateCareerThunk({ id, data }));

      if (updateCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar carrera',
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

  const patchCareer = useCallback(
    async (
      id: string,
      data: Partial<UpdateCareerRequest>
    ): Promise<Result<Career>> => {
      const result = await dispatch(patchCareerThunk({ id, data }));

      if (patchCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar carrera',
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

  const deleteCareer = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteCareerThunk(id));

      if (deleteCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar carrera',
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

  const activateCareer = useCallback(
    async (id: string): Promise<Result<Career>> => {
      const result = await dispatch(activateCareerThunk(id));

      if (activateCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al activar carrera',
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

  const deactivateCareer = useCallback(
    async (id: string): Promise<Result<Career>> => {
      const result = await dispatch(deactivateCareerThunk(id));

      if (deactivateCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al desactivar carrera',
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
    dispatch(clearCurrentCareer());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    careers,
    pagination,
    currentCareer,

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
    listCareers,
    getCareerById,
    createCareer,
    updateCareer,
    patchCareer,
    deleteCareer,
    activateCareer,
    deactivateCareer,

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
