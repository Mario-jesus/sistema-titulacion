import type { GraduationOption } from '@entities/graduation-option';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListGraduationOptionsParams,
  ListGraduationOptionsResponse,
  CreateGraduationOptionRequest,
  UpdateGraduationOptionRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Opciones de Titulación
 */
export const graduationOptionsService = {
  /**
   * Obtiene la lista de opciones de titulación con paginación y filtros
   */
  async list(
    params?: ListGraduationOptionsParams
  ): Promise<ListGraduationOptionsResponse> {
    try {
      logger.log('Obteniendo lista de opciones de titulación...', params);

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
        ? `${API_ENDPOINTS.GRADUATION_OPTIONS.LIST}?${queryString}`
        : API_ENDPOINTS.GRADUATION_OPTIONS.LIST;

      const response = await apiClient.get<ListGraduationOptionsResponse>(url);

      logger.log('Lista de opciones de titulación obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de opciones de titulación:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una opción de titulación por ID
   */
  async getById(id: string): Promise<GraduationOption> {
    try {
      logger.log('Obteniendo opción de titulación...', { id });

      const response = await apiClient.get<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.DETAIL(id)
      );

      logger.log('Opción de titulación obtenida exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva opción de titulación
   */
  async create(
    data: CreateGraduationOptionRequest
  ): Promise<GraduationOption> {
    try {
      logger.log('Creando opción de titulación...', data);

      const response = await apiClient.post<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.CREATE,
        data
      );

      logger.log('Opción de titulación creada exitosamente', {
        id: response.id,
      });

      return response;
    } catch (error) {
      logger.error('Error al crear opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una opción de titulación existente (PUT - reemplazo completo)
   */
  async update(
    id: string,
    data: UpdateGraduationOptionRequest
  ): Promise<GraduationOption> {
    try {
      logger.log('Actualizando opción de titulación...', { id, data });

      const response = await apiClient.put<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.UPDATE(id),
        data
      );

      logger.log('Opción de titulación actualizada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente una opción de titulación (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateGraduationOptionRequest>
  ): Promise<GraduationOption> {
    try {
      logger.log('Actualizando parcialmente opción de titulación...', {
        id,
        data,
      });

      const response = await apiClient.patch<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.PATCH(id),
        data
      );

      logger.log('Opción de titulación actualizada parcialmente exitosamente', {
        id,
      });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Elimina una opción de titulación
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando opción de titulación...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.GRADUATION_OPTIONS.DELETE(id)
      );

      logger.log('Opción de titulación eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Activa una opción de titulación
   */
  async activate(id: string): Promise<GraduationOption> {
    try {
      logger.log('Activando opción de titulación...', { id });

      const response = await apiClient.post<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.ACTIVATE(id)
      );

      logger.log('Opción de titulación activada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar opción de titulación:', error);
      throw error;
    }
  },

  /**
   * Desactiva una opción de titulación
   */
  async deactivate(id: string): Promise<GraduationOption> {
    try {
      logger.log('Desactivando opción de titulación...', { id });

      const response = await apiClient.post<GraduationOption>(
        API_ENDPOINTS.GRADUATION_OPTIONS.DEACTIVATE(id)
      );

      logger.log('Opción de titulación desactivada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar opción de titulación:', error);
      throw error;
    }
  },
};
