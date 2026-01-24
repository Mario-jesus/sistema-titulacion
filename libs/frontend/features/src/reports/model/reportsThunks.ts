import { createAsyncThunk } from '@reduxjs/toolkit';
import { logger } from '@shared/lib/logger';
import { reportsService } from '../api/reportsService';
import type { GenerateReportRequest, ReportResponse } from './types';

/**
 * Thunks para la gestión de reportes
 */

// ========== GENERATE REPORT ==========
export const generateReportThunk = createAsyncThunk<
  ReportResponse,
  GenerateReportRequest,
  { rejectValue: string }
>('reports/generate', async (request, { rejectWithValue }) => {
  try {
    const response = await reportsService.generate(request);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al generar reporte';
    logger.error('Error en generateReportThunk:', error);
    return rejectWithValue(message);
  }
});
