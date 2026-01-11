import { apiClient, API_ENDPOINTS } from '@shared/api';
import type { Generation } from '@entities/generation';
import type { ListResponse } from '@shared/lib/model';

/**
 * Helper para cargar generaciones desde el API
 * Usado en el formulario de estudiantes para el selector de generaciones
 */
export async function loadGenerations(): Promise<Generation[]> {
  try {
    const response = await apiClient.get<ListResponse<Generation>>(
      `${API_ENDPOINTS.GENERATIONS.LIST}?limit=1000&activeOnly=true`
    );
    return response.data;
  } catch (error) {
    console.error('Error al cargar generaciones:', error);
    return [];
  }
}
