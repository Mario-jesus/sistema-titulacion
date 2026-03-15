import { apiClient, API_ENDPOINTS } from '@shared/api';
import type { Generation } from '@entities/generation';
import type { ListResponse } from '@shared/lib/model';

export interface LoadGenerationsOptions {
  /** Si true, solo devuelve generaciones activas. Si false, incluye inactivas (útil para resolver nombres en listas). Por defecto true. */
  activeOnly?: boolean;
}

/**
 * Helper para cargar generaciones desde el API.
 * - Por defecto activeOnly=true: para selectores/formularios (solo generaciones activas).
 * - activeOnly=false: para listas que deben mostrar el nombre de cualquier generación referenciada (incl. inactivas).
 */
export async function loadGenerations(
  options: LoadGenerationsOptions = {}
): Promise<Generation[]> {
  const { activeOnly = true } = options;
  try {
    const response = await apiClient.get<ListResponse<Generation>>(
      `${API_ENDPOINTS.GENERATIONS.LIST}?limit=1000&activeOnly=${activeOnly}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al cargar generaciones:', error);
    return [];
  }
}
