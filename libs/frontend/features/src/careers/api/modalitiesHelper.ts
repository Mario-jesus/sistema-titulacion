import type { Modality } from '@entities/modality';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';

/**
 * Helper para cargar modalidades activas
 * Se usa para poblar el selector de modalidades en el formulario de carreras
 */
export async function loadActiveModalities(): Promise<Modality[]> {
  try {
    logger.log('Cargando modalidades activas...');

    const searchParams = new URLSearchParams();
    searchParams.append('activeOnly', 'true');
    searchParams.append('limit', '100'); // Cargar todas las modalidades activas

    const url = `${API_ENDPOINTS.MODALITIES.LIST}?${searchParams.toString()}`;
    const response = await apiClient.get<{
      data: Modality[];
      pagination: any;
    }>(url);

    logger.log('Modalidades activas cargadas exitosamente', {
      count: response.data.length,
    });

    return response.data;
  } catch (error) {
    logger.error('Error al cargar modalidades activas:', error);
    throw error;
  }
}
