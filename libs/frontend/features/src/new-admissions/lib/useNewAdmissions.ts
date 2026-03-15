import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { NewAdmission } from '@entities/new-admission';
import type {
  ListNewAdmissionsParams,
  ListNewAdmissionsResponse,
  CreateNewAdmissionRequest,
  UpdateNewAdmissionRequest,
} from '../model/types';
import {
  listNewAdmissionsThunk,
  getNewAdmissionByIdThunk,
  createNewAdmissionThunk,
  updateNewAdmissionThunk,
  patchNewAdmissionThunk,
  deleteNewAdmissionThunk,
  activateNewAdmissionThunk,
  deactivateNewAdmissionThunk,
} from '../model/newAdmissionsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentNewAdmission,
  clearAllErrors,
  type NewAdmissionsState,
} from '../model/newAdmissionsSlice';

interface AppState extends BaseAppState {
  newAdmissions: NewAdmissionsState;
}

export function useNewAdmissions() {
  const dispatch = useDispatch<AppDispatch>();

  const newAdmissions = useSelector(
    (state: AppState) => state.newAdmissions.newAdmissions
  );
  const pagination = useSelector(
    (state: AppState) => state.newAdmissions.pagination
  );
  const currentNewAdmission = useSelector(
    (state: AppState) => state.newAdmissions.currentNewAdmission
  );

  const isLoadingList = useSelector(
    (state: AppState) => state.newAdmissions.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.newAdmissions.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.newAdmissions.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.newAdmissions.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.newAdmissions.isDeleting
  );
  const isActivating = useSelector(
    (state: AppState) => state.newAdmissions.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.newAdmissions.isDeactivating
  );

  const listError = useSelector(
    (state: AppState) => state.newAdmissions.listError
  );
  const detailError = useSelector(
    (state: AppState) => state.newAdmissions.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.newAdmissions.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.newAdmissions.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.newAdmissions.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.newAdmissions.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.newAdmissions.deactivateError
  );

  const listNewAdmissions = useCallback(
    async (
      params?: ListNewAdmissionsParams
    ): Promise<Result<ListNewAdmissionsResponse>> => {
      const result = await dispatch(listNewAdmissionsThunk(params));

      if (listNewAdmissionsThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al cargar registros de ingreso',
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

  const getNewAdmissionById = useCallback(
    async (id: string): Promise<Result<NewAdmission>> => {
      const result = await dispatch(getNewAdmissionByIdThunk(id));

      if (getNewAdmissionByIdThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener registro de ingreso',
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

  const createNewAdmission = useCallback(
    async (data: CreateNewAdmissionRequest): Promise<Result<NewAdmission>> => {
      const result = await dispatch(createNewAdmissionThunk(data));

      if (createNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al crear registro',
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

  const updateNewAdmission = useCallback(
    async (
      id: string,
      data: UpdateNewAdmissionRequest
    ): Promise<Result<NewAdmission>> => {
      const result = await dispatch(updateNewAdmissionThunk({ id, data }));

      if (updateNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar registro',
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

  const patchNewAdmission = useCallback(
    async (
      id: string,
      data: Partial<UpdateNewAdmissionRequest>
    ): Promise<Result<NewAdmission>> => {
      const result = await dispatch(patchNewAdmissionThunk({ id, data }));

      if (patchNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al actualizar registro',
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

  const deleteNewAdmission = useCallback(
    async (id: string): Promise<Result<string>> => {
      const result = await dispatch(deleteNewAdmissionThunk(id));

      if (deleteNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al eliminar registro',
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

  const activateNewAdmission = useCallback(
    async (id: string): Promise<Result<NewAdmission>> => {
      const result = await dispatch(activateNewAdmissionThunk(id));

      if (activateNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al activar registro',
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

  const deactivateNewAdmission = useCallback(
    async (id: string): Promise<Result<NewAdmission>> => {
      const result = await dispatch(deactivateNewAdmissionThunk(id));

      if (deactivateNewAdmissionThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al desactivar registro',
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
    dispatch(clearCurrentNewAdmission());
  }, [dispatch]);

  return {
    newAdmissions,
    pagination,
    currentNewAdmission,
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    isActivating,
    isDeactivating,
    listError,
    detailError,
    createError,
    updateError,
    deleteError,
    activateError,
    deactivateError,
    listNewAdmissions,
    getNewAdmissionById,
    createNewAdmission,
    updateNewAdmission,
    patchNewAdmission,
    deleteNewAdmission,
    activateNewAdmission,
    deactivateNewAdmission,
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearCreateErrors,
    clearUpdateErrors,
    clearDeleteErrors,
    clearCurrent,
  };
}
