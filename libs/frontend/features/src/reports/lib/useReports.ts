import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { Result } from '@shared/lib/model';
import { generateReportThunk } from '../model/reportsThunks';
import {
  clearReport,
  clearError,
  type ReportsState,
} from '../model/reportsSlice';
import type { GenerateReportRequest, ReportResponse } from '../model/types';

interface AppState extends BaseAppState {
  reports: ReportsState;
}

export function useReports() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const currentReport = useSelector(
    (state: AppState) => state.reports.currentReport
  );
  const isLoading = useSelector((state: AppState) => state.reports.isLoading);
  const error = useSelector((state: AppState) => state.reports.error);

  // ========== ACTIONS ==========
  const generateReport = useCallback(
    async (request: GenerateReportRequest): Promise<Result<ReportResponse>> => {
      try {
        const result = await dispatch(generateReportThunk(request)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error al generar reporte';
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const clearCurrentReport = useCallback(() => {
    dispatch(clearReport());
  }, [dispatch]);

  const clearReportError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Estado
    currentReport,
    isLoading,
    error,

    // Acciones
    generateReport,
    clearCurrentReport,
    clearReportError,
  };
}
