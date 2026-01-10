import type { Generation } from '@entities/generation';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListGenerationsParams,
  ListGenerationsResponse,
  CreateGenerationRequest,
  UpdateGenerationRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Generaciones
 */
export const generationsService = {
  /**
   * Obtiene la lista de generaciones con paginación y filtros
   */
  async list(params?: ListGenerationsParams): Promise<ListGenerationsResponse> {
    try {
      logger.log('Obteniendo lista de generaciones...', params);

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
        ? `${API_ENDPOINTS.GENERATIONS.LIST}?${queryString}`
        : API_ENDPOINTS.GENERATIONS.LIST;

      const response = await apiClient.get<ListGenerationsResponse>(url);

      logger.log('Lista de generaciones obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de generaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una generación por ID
   */
  async getById(id: string): Promise<Generation> {
    try {
      logger.log('Obteniendo generación...', { id });

      const response = await apiClient.get<Generation>(
        API_ENDPOINTS.GENERATIONS.DETAIL(id)
      );

      logger.log('Generación obtenida exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener generación:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva generación
   */
  async create(data: CreateGenerationRequest): Promise<Generation> {
    try {
      logger.log('Creando generación...', data);

      // Asegurar que las fechas estén en formato ISO string
      const payload = {
        ...data,
        startYear:
          data.startYear instanceof Date
            ? data.startYear.toISOString()
            : data.startYear,
        endYear:
          data.endYear instanceof Date
            ? data.endYear.toISOString()
            : data.endYear,
      };

      const response = await apiClient.post<Generation>(
        API_ENDPOINTS.GENERATIONS.CREATE,
        payload
      );

      logger.log('Generación creada exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear generación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una generación existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateGenerationRequest): Promise<Generation> {
    try {
      logger.log('Actualizando generación...', { id, data });

      // Asegurar que las fechas estén en formato ISO string si se proporcionan
      const payload = {
        ...data,
        ...(data.startYear && {
          startYear:
            data.startYear instanceof Date
              ? data.startYear.toISOString()
              : data.startYear,
        }),
        ...(data.endYear && {
          endYear:
            data.endYear instanceof Date
              ? data.endYear.toISOString()
              : data.endYear,
        }),
      };

      const response = await apiClient.put<Generation>(
        API_ENDPOINTS.GENERATIONS.UPDATE(id),
        payload
      );

      logger.log('Generación actualizada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar generación:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente una generación (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateGenerationRequest>
  ): Promise<Generation> {
    try {
      logger.log('Actualizando parcialmente generación...', { id, data });

      // Asegurar que las fechas estén en formato ISO string si se proporcionan
      const payload = {
        ...data,
        ...(data.startYear && {
          startYear:
            data.startYear instanceof Date
              ? data.startYear.toISOString()
              : data.startYear,
        }),
        ...(data.endYear && {
          endYear:
            data.endYear instanceof Date
              ? data.endYear.toISOString()
              : data.endYear,
        }),
      };

      const response = await apiClient.patch<Generation>(
        API_ENDPOINTS.GENERATIONS.PATCH(id),
        payload
      );

      logger.log('Generación actualizada parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente generación:', error);
      throw error;
    }
  },

  /**
   * Elimina una generación
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando generación...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.GENERATIONS.DELETE(id)
      );

      logger.log('Generación eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar generación:', error);
      throw error;
    }
  },

  /**
   * Activa una generación
   */
  async activate(id: string): Promise<Generation> {
    try {
      logger.log('Activando generación...', { id });

      const response = await apiClient.post<Generation>(
        API_ENDPOINTS.GENERATIONS.ACTIVATE(id)
      );

      logger.log('Generación activada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar generación:', error);
      throw error;
    }
  },

  /**
   * Desactiva una generación
   */
  async deactivate(id: string): Promise<Generation> {
    try {
      logger.log('Desactivando generación...', { id });

      const response = await apiClient.post<Generation>(
        API_ENDPOINTS.GENERATIONS.DEACTIVATE(id)
      );

      logger.log('Generación desactivada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar generación:', error);
      throw error;
    }
  },
};
