import { useCallback } from 'react';
import type { Result } from '@shared/lib/model';
import type { DashboardResponse } from '../model/types';
import { dashboardService } from '../api';

/**
 * Hook personalizado para obtener los datos del dashboard
 */
export function useDashboard() {
  /**
   * Obtiene los datos del dashboard
   */
  const getDashboard = useCallback(async (): Promise<
    Result<DashboardResponse>
  > => {
    try {
      const response = await dashboardService.get();
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error al cargar el dashboard',
      };
    }
  }, []);

  return {
    getDashboard,
  };
}
