import type { Quota } from '@entities/quota';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListQuotasParams,
  ListQuotasResponse,
  CreateQuotaRequest,
  UpdateQuotaRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Cupos
 */
export const quotasService = {
  /**
   * Obtiene la lista de cupos con paginación y filtros
   */
  async list(params?: ListQuotasParams): Promise<ListQuotasResponse> {
    try {
      logger.log('Obteniendo lista de cupos...', params);

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
      if (params?.careerId) {
        searchParams.append('careerId', params.careerId);
      }
      if (params?.generationId) {
        searchParams.append('generationId', params.generationId);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.QUOTAS.LIST}?${queryString}`
        : API_ENDPOINTS.QUOTAS.LIST;

      const response = await apiClient.get<ListQuotasResponse>(url);

      logger.log('Lista de cupos obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de cupos:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un cupo por ID
   */
  async getById(id: string): Promise<Quota> {
    try {
      logger.log('Obteniendo cupo...', { id });

      const response = await apiClient.get<Quota>(
        API_ENDPOINTS.QUOTAS.DETAIL(id)
      );

      logger.log('Cupo obtenido exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener cupo:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo cupo
   */
  async create(data: CreateQuotaRequest): Promise<Quota> {
    try {
      logger.log('Creando cupo...', data);

      const response = await apiClient.post<Quota>(
        API_ENDPOINTS.QUOTAS.CREATE,
        data
      );

      logger.log('Cupo creado exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear cupo:', error);
      throw error;
    }
  },

  /**
   * Actualiza un cupo existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateQuotaRequest): Promise<Quota> {
    try {
      logger.log('Actualizando cupo...', { id, data });

      const response = await apiClient.put<Quota>(
        API_ENDPOINTS.QUOTAS.UPDATE(id),
        data
      );

      logger.log('Cupo actualizado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar cupo:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente un cupo (PATCH)
   */
  async patch(id: string, data: Partial<UpdateQuotaRequest>): Promise<Quota> {
    try {
      logger.log('Actualizando parcialmente cupo...', { id, data });

      const response = await apiClient.patch<Quota>(
        API_ENDPOINTS.QUOTAS.PATCH(id),
        data
      );

      logger.log('Cupo actualizado parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente cupo:', error);
      throw error;
    }
  },

  /**
   * Elimina un cupo
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando cupo...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.QUOTAS.DELETE(id)
      );

      logger.log('Cupo eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar cupo:', error);
      throw error;
    }
  },

  /**
   * Activa un cupo
   */
  async activate(id: string): Promise<Quota> {
    try {
      logger.log('Activando cupo...', { id });

      const response = await apiClient.post<Quota>(
        API_ENDPOINTS.QUOTAS.ACTIVATE(id)
      );

      logger.log('Cupo activado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar cupo:', error);
      throw error;
    }
  },

  /**
   * Desactiva un cupo
   */
  async deactivate(id: string): Promise<Quota> {
    try {
      logger.log('Desactivando cupo...', { id });

      const response = await apiClient.post<Quota>(
        API_ENDPOINTS.QUOTAS.DEACTIVATE(id)
      );

      logger.log('Cupo desactivado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar cupo:', error);
      throw error;
    }
  },
};
