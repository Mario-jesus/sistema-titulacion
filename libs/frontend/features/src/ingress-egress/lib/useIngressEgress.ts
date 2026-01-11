import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { extractErrorCode } from '@shared/lib/model';
import type { IngressEgress } from '@entities/ingress-egress';
import type {
  ListIngressEgressParams,
  ListIngressEgressResponse,
} from '../model/types';
import {
  listIngressEgressThunk,
  getIngressEgressByGenerationAndCareerThunk,
} from '../model/ingressEgressThunks';
import {
  clearListError,
  clearDetailError,
  clearCurrentIngressEgress,
  clearAllErrors,
  type IngressEgressState,
} from '../model/ingressEgressSlice';

interface AppState extends BaseAppState {
  ingressEgress: IngressEgressState;
}

export function useIngressEgress() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const ingressEgressList = useSelector(
    (state: AppState) => state.ingressEgress.ingressEgressList
  );
  const pagination = useSelector(
    (state: AppState) => state.ingressEgress.pagination
  );
  const currentIngressEgress = useSelector(
    (state: AppState) => state.ingressEgress.currentIngressEgress
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.ingressEgress.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.ingressEgress.isLoadingDetail
  );

  // Errores
  const listError = useSelector(
    (state: AppState) => state.ingressEgress.listError
  );
  const detailError = useSelector(
    (state: AppState) => state.ingressEgress.detailError
  );

  // ========== ACTIONS ==========
  const listIngressEgress = useCallback(
    async (
      params?: ListIngressEgressParams
    ): Promise<Result<ListIngressEgressResponse>> => {
      const result = await dispatch(listIngressEgressThunk(params));

      if (listIngressEgressThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener lista de ingreso y egreso',
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

  const getIngressEgressByGenerationAndCareer = useCallback(
    async (
      generationId: string,
      careerId: string
    ): Promise<Result<IngressEgress>> => {
      const result = await dispatch(
        getIngressEgressByGenerationAndCareerThunk({ generationId, careerId })
      );

      if (getIngressEgressByGenerationAndCareerThunk.rejected.match(result)) {
        return {
          success: false,
          error: result.payload || 'Error al obtener ingreso y egreso',
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

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentIngressEgress());
  }, [dispatch]);

  return {
    // ========== DATA ==========
    ingressEgressList,
    pagination,
    currentIngressEgress,

    // ========== LOADING STATES ==========
    isLoadingList,
    isLoadingDetail,

    // ========== ERRORS ==========
    listError,
    detailError,

    // ========== ACTIONS ==========
    listIngressEgress,
    getIngressEgressByGenerationAndCareer,

    // ========== CLEAR ACTIONS ==========
    clearErrors,
    clearListErrors,
    clearDetailErrors,
    clearCurrent,
  };
}
