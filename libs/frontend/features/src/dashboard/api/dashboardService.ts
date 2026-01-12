import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type { DashboardResponse } from '../model/types';

/**
 * Servicio para interactuar con la API del Dashboard
 */
export const dashboardService = {
  /**
   * Obtiene los datos del dashboard
   */
  async get(): Promise<DashboardResponse> {
    try {
      logger.log('Obteniendo datos del dashboard...');

      const response = await apiClient.get<DashboardResponse>(
        API_ENDPOINTS.DASHBOARD.GET
      );

      logger.log('Datos del dashboard obtenidos exitosamente');

      return response;
    } catch (error) {
      logger.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  },
};
