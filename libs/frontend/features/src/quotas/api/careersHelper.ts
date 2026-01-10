import { apiClient, API_ENDPOINTS } from '@shared/api';
import type { Career } from '@entities/career';
import type { ListResponse } from '@shared/lib/model';

/**
 * Helper para cargar carreras desde el API
 * Usado en el formulario de cupos para el selector de carreras
 */
export async function loadCareers(): Promise<Career[]> {
  try {
    const response = await apiClient.get<ListResponse<Career>>(
      `${API_ENDPOINTS.CAREERS.LIST}?limit=1000&activeOnly=true`
    );
    return response.data;
  } catch (error) {
    console.error('Error al cargar carreras:', error);
    return [];
  }
}
