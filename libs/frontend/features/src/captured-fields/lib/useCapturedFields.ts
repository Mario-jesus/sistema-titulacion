import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type {
  CreateCapturedFieldsRequest,
  UpdateCapturedFieldsRequest,
} from '../model/types';
import {
  getCapturedFieldsByIdThunk,
  createCapturedFieldsThunk,
  updateCapturedFieldsThunk,
  patchCapturedFieldsThunk,
  deleteCapturedFieldsThunk,
} from '../model/capturedFieldsThunks';
import {
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentCapturedFields,
  clearAllErrors,
  type CapturedFieldsState,
} from '../model/capturedFieldsSlice';

interface AppState extends BaseAppState {
  capturedFields: CapturedFieldsState;
}

export function useCapturedFields() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const currentCapturedFields = useSelector(
    (state: AppState) => state.capturedFields.currentCapturedFields
  );

  // Estados de carga
  const isLoadingDetail = useSelector(
    (state: AppState) => state.capturedFields.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.capturedFields.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.capturedFields.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.capturedFields.isDeleting
  );

  // Errores
  const detailError = useSelector(
    (state: AppState) => state.capturedFields.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.capturedFields.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.capturedFields.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.capturedFields.deleteError
  );

  // ========== ACTIONS ==========
  const getCapturedFieldsById = useCallback(
    async (id: string) => {
      const result = await dispatch(getCapturedFieldsByIdThunk(id));

      if (getCapturedFieldsByIdThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al obtener campos capturados');
      }

      return result.payload;
    },
    [dispatch]
  );

  const createCapturedFields = useCallback(
    async (data: CreateCapturedFieldsRequest) => {
      const result = await dispatch(createCapturedFieldsThunk(data));

      if (createCapturedFieldsThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al crear campos capturados');
      }

      return result.payload;
    },
    [dispatch]
  );

  const updateCapturedFields = useCallback(
    async (id: string, data: UpdateCapturedFieldsRequest) => {
      const result = await dispatch(updateCapturedFieldsThunk({ id, data }));

      if (updateCapturedFieldsThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al actualizar campos capturados'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  const patchCapturedFields = useCallback(
    async (id: string, data: Partial<UpdateCapturedFieldsRequest>) => {
      const result = await dispatch(patchCapturedFieldsThunk({ id, data }));

      if (patchCapturedFieldsThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al actualizar campos capturados'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  const deleteCapturedFields = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteCapturedFieldsThunk(id));

      if (deleteCapturedFieldsThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al eliminar campos capturados'
        );
      }

      return result.payload;
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

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentCapturedFields());
  }, [dispatch]);

  return {
    // Estado
    currentCapturedFields,
    isLoadingDetail,
    isCreating,
    isUpdating,
    isDeleting,
    detailError,
    createError,
    updateError,
    deleteError,

    // Acciones
    getCapturedFieldsById,
    createCapturedFields,
    updateCapturedFields,
    patchCapturedFields,
    deleteCapturedFields,

    // Limpiar errores
    clearErrors,
    clearDetailErr,
    clearCreateErr,
    clearUpdateErr,
    clearDeleteErr,
    clearCurrent,
  };
}
