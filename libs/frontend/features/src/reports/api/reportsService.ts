import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type { GenerateReportRequest, ReportResponse } from '../model/types';

/**
 * Servicio para interactuar con la API de Reportes
 */
export const reportsService = {
  /**
   * Genera un reporte con los parámetros especificados
   */
  async generate(request: GenerateReportRequest): Promise<ReportResponse> {
    try {
      logger.log('Generando reporte...', request);

      const response = await apiClient.post<ReportResponse>(
        API_ENDPOINTS.REPORTS.GENERATE,
        request
      );

      logger.log('Reporte generado exitosamente', {
        type: response.type,
        tableType: response.tableType,
      });

      return response;
    } catch (error) {
      logger.error('Error al generar reporte:', error);
      throw error;
    }
  },
};
