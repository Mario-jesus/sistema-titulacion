import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type {
  ListGenerationsParams,
  CreateGenerationRequest,
  UpdateGenerationRequest,
} from '../model/types';
import {
  listGenerationsThunk,
  getGenerationByIdThunk,
  createGenerationThunk,
  updateGenerationThunk,
  patchGenerationThunk,
  deleteGenerationThunk,
  activateGenerationThunk,
  deactivateGenerationThunk,
} from '../model/generationsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearCurrentGeneration,
  clearAllErrors,
  type GenerationsState,
} from '../model/generationsSlice';

interface AppState extends BaseAppState {
  generations: GenerationsState;
}

export function useGenerations() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const generations = useSelector(
    (state: AppState) => state.generations.generations
  );
  const pagination = useSelector(
    (state: AppState) => state.generations.pagination
  );
  const currentGeneration = useSelector(
    (state: AppState) => state.generations.currentGeneration
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.generations.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.generations.isLoadingDetail
  );
  const isCreating = useSelector(
    (state: AppState) => state.generations.isCreating
  );
  const isUpdating = useSelector(
    (state: AppState) => state.generations.isUpdating
  );
  const isDeleting = useSelector(
    (state: AppState) => state.generations.isDeleting
  );
  const isActivating = useSelector(
    (state: AppState) => state.generations.isActivating
  );
  const isDeactivating = useSelector(
    (state: AppState) => state.generations.isDeactivating
  );

  // Errores
  const listError = useSelector(
    (state: AppState) => state.generations.listError
  );
  const detailError = useSelector(
    (state: AppState) => state.generations.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.generations.createError
  );
  const updateError = useSelector(
    (state: AppState) => state.generations.updateError
  );
  const deleteError = useSelector(
    (state: AppState) => state.generations.deleteError
  );
  const activateError = useSelector(
    (state: AppState) => state.generations.activateError
  );
  const deactivateError = useSelector(
    (state: AppState) => state.generations.deactivateError
  );

  // ========== ACTIONS ==========
  const listGenerations = useCallback(
    async (params?: ListGenerationsParams) => {
      const result = await dispatch(listGenerationsThunk(params));

      if (listGenerationsThunk.rejected.match(result)) {
        throw new Error(
          result.payload || 'Error al obtener lista de generaciones'
        );
      }

      return result.payload;
    },
    [dispatch]
  );

  const getGenerationById = useCallback(
    async (id: string) => {
      const result = await dispatch(getGenerationByIdThunk(id));

      if (getGenerationByIdThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al obtener generación');
      }

      return result.payload;
    },
    [dispatch]
  );

  const createGeneration = useCallback(
    async (data: CreateGenerationRequest) => {
      const result = await dispatch(createGenerationThunk(data));

      if (createGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al crear generación');
      }

      return result.payload;
    },
    [dispatch]
  );

  const updateGeneration = useCallback(
    async (id: string, data: UpdateGenerationRequest) => {
      const result = await dispatch(updateGenerationThunk({ id, data }));

      if (updateGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar generación');
      }

      return result.payload;
    },
    [dispatch]
  );

  const patchGeneration = useCallback(
    async (id: string, data: Partial<UpdateGenerationRequest>) => {
      const result = await dispatch(patchGenerationThunk({ id, data }));

      if (patchGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al actualizar generación');
      }

      return result.payload;
    },
    [dispatch]
  );

  const deleteGeneration = useCallback(
    async (id: string) => {
      const result = await dispatch(deleteGenerationThunk(id));

      if (deleteGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al eliminar generación');
      }
    },
    [dispatch]
  );

  const activateGeneration = useCallback(
    async (id: string) => {
      const result = await dispatch(activateGenerationThunk(id));

      if (activateGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al activar generación');
      }

      return result.payload;
    },
    [dispatch]
  );

  const deactivateGeneration = useCallback(
    async (id: string) => {
      const result = await dispatch(deactivateGenerationThunk(id));

      if (deactivateGenerationThunk.rejected.match(result)) {
        throw new Error(result.payload || 'Error al desactivar generación');
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
    dispatch(clearCurrentGeneration());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    generations,
    pagination,
    currentGeneration,

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
    listGenerations,
    getGenerationById,
    createGeneration,
    updateGeneration,
    patchGeneration,
    deleteGeneration,
    activateGeneration,
    deactivateGeneration,

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
