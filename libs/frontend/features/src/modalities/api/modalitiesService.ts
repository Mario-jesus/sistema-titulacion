import type { Modality } from '@entities/modality';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListModalitiesParams,
  ListModalitiesResponse,
  CreateModalityRequest,
  UpdateModalityRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Modalidades
 */
export const modalitiesService = {
  /**
   * Obtiene la lista de modalidades con paginación y filtros
   */
  async list(params?: ListModalitiesParams): Promise<ListModalitiesResponse> {
    try {
      logger.log('Obteniendo lista de modalidades...', params);

      const searchParams = new URLSearchParams();

      if (params?.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params?.sortBy && params?.sortOrder) {
        searchParams.append('sortBy', params.sortBy);
        searchParams.append('sortOrder', params.sortOrder);
      }
      if (params?.activeOnly) {
        searchParams.append('activeOnly', 'true');
      }
      if (params?.search) {
        searchParams.append('search', params.search);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.MODALITIES.LIST}?${queryString}`
        : API_ENDPOINTS.MODALITIES.LIST;

      const response = await apiClient.get<ListModalitiesResponse>(url);

      logger.log('Lista de modalidades obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de modalidades:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una modalidad por ID
   */
  async getById(id: string): Promise<Modality> {
    try {
      logger.log('Obteniendo modalidad...', { id });

      const response = await apiClient.get<Modality>(
        API_ENDPOINTS.MODALITIES.DETAIL(id)
      );

      logger.log('Modalidad obtenida exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener modalidad:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva modalidad
   */
  async create(data: CreateModalityRequest): Promise<Modality> {
    try {
      logger.log('Creando modalidad...', data);

      const response = await apiClient.post<Modality>(
        API_ENDPOINTS.MODALITIES.CREATE,
        data
      );

      logger.log('Modalidad creada exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear modalidad:', error);
      throw error;
    }
  },

  /**
   * Actualiza una modalidad existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateModalityRequest): Promise<Modality> {
    try {
      logger.log('Actualizando modalidad...', { id, data });

      const response = await apiClient.put<Modality>(
        API_ENDPOINTS.MODALITIES.UPDATE(id),
        data
      );

      logger.log('Modalidad actualizada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar modalidad:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente una modalidad (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateModalityRequest>
  ): Promise<Modality> {
    try {
      logger.log('Actualizando parcialmente modalidad...', { id, data });

      const response = await apiClient.patch<Modality>(
        API_ENDPOINTS.MODALITIES.PATCH(id),
        data
      );

      logger.log('Modalidad actualizada parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente modalidad:', error);
      throw error;
    }
  },

  /**
   * Elimina una modalidad
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando modalidad...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.MODALITIES.DELETE(id)
      );

      logger.log('Modalidad eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar modalidad:', error);
      throw error;
    }
  },

  /**
   * Activa una modalidad
   */
  async activate(id: string): Promise<Modality> {
    try {
      logger.log('Activando modalidad...', { id });

      const response = await apiClient.post<Modality>(
        API_ENDPOINTS.MODALITIES.ACTIVATE(id)
      );

      logger.log('Modalidad activada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar modalidad:', error);
      throw error;
    }
  },

  /**
   * Desactiva una modalidad
   */
  async deactivate(id: string): Promise<Modality> {
    try {
      logger.log('Desactivando modalidad...', { id });

      const response = await apiClient.post<Modality>(
        API_ENDPOINTS.MODALITIES.DEACTIVATE(id)
      );

      logger.log('Modalidad desactivada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar modalidad:', error);
      throw error;
    }
  },
};
