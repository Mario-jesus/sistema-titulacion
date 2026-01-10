import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type {
  ListModalitiesParams,
  CreateModalityRequest,
  UpdateModalityRequest,
} from '../model/types';
import {
  listModalitiesThunk,
  getModalityByIdThunk,
  createModalityThunk,
  updateModalityThunk,
  patchModalityThunk,
  deleteModalityThunk,
  activateModalityThunk,
  deactivateModalityThunk,
} from '../model/modalitiesThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentModality,
  clearAllErrors,
  type ModalitiesState,
} from '../model/modalitiesSlice';

interface AppState extends BaseAppState {
  modalities: ModalitiesState;
}

export function useModalities() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const modalities = useSelector(
    (state: AppState) => state.modalities.modalities
  );
  const pagination = useSelector(
    (state: AppState) => state.modalities.pagination
  );
  const currentModality = useSelector(
    (state: AppState) => state.modalities.currentModality
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.modalities.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.modalities.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.modalities.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.modalities.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.modalities.isDeleting
  );
  const isActivating = useSelector(
    (state: AppState) => state.modalities.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.modalities.isDeactivating
  );

  // Errores
  const listError = useSelector(
    (state: AppState) => state.modalities.listError
  );
  const detailError = useSelector(
    (state: AppState) => state.modalities.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.modalities.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.modalities.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.modalities.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.modalities.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.modalities.deactivateError
  );

  // ========== ACTIONS ==========
  const listModalities = useCallback(
    async (params?: ListModalitiesParams) => {
      const result = await dispatch(listModalitiesThunk(params));

      if (listModalitiesThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al obtener lista de modalidades'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  const getModalityById = useCallback(
    async (id: string) => {
      const result = await dispatch(getModalityByIdThunk(id));

      if (getModalityByIdThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al obtener modalidad');
      }

      return result.payload;
    },
    [dispatch]
  );

  const createModality = useCallback(
    async (data: CreateModalityRequest) => {
      const result = await dispatch(createModalityThunk(data));

      if (createModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al crear modalidad');
      }

      return result.payload;
    },
    [dispatch]
  );

  const updateModality = useCallback(
    async (id: string, data: UpdateModalityRequest) => {
      const result = await dispatch(updateModalityThunk({ id, data }));

      if (updateModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar modalidad');
      }

      return result.payload;
    },
    [dispatch]
  );

  const patchModality = useCallback(
    async (id: string, data: Partial<UpdateModalityRequest>) => {
      const result = await dispatch(patchModalityThunk({ id, data }));

      if (patchModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar modalidad');
      }

      return result.payload;
    },
    [dispatch]
  );

  const deleteModality = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteModalityThunk(id));

      if (deleteModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al eliminar modalidad');
      }
    },
    [dispatch]
  );

  const activateModality = useCallback(
    async (id: string) => {
      const result = await dispatch(activateModalityThunk(id));

      if (activateModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al activar modalidad');
      }

      return result.payload;
    },
    [dispatch]
  );

  const deactivateModality = useCallback(
    async (id: string) => {
      const result = await dispatch(deactivateModalityThunk(id));

      if (deactivateModalityThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al desactivar modalidad');
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

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentModality());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    modalities,
    pagination,
    currentModality,

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
    listModalities,
    getModalityById,
    createModality,
    updateModality,
    patchModality,
    deleteModality,
    activateModality,
    deactivateModality,

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
