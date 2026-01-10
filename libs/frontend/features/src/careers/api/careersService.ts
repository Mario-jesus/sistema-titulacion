import type { Career } from '@entities/career';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListCareersParams,
  ListCareersResponse,
  CreateCareerRequest,
  UpdateCareerRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Carreras
 */
export const careersService = {
  /**
   * Obtiene la lista de carreras con paginación y filtros
   */
  async list(params?: ListCareersParams): Promise<ListCareersResponse> {
    try {
      logger.log('Obteniendo lista de carreras...', params);

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
        ? `${API_ENDPOINTS.CAREERS.LIST}?${queryString}`
        : API_ENDPOINTS.CAREERS.LIST;

      const response = await apiClient.get<ListCareersResponse>(url);

      logger.log('Lista de carreras obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de carreras:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de una carrera por ID
   */
  async getById(id: string): Promise<Career> {
    try {
      logger.log('Obteniendo carrera...', { id });

      const response = await apiClient.get<Career>(
        API_ENDPOINTS.CAREERS.DETAIL(id)
      );

      logger.log('Carrera obtenida exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener carrera:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva carrera
   */
  async create(data: CreateCareerRequest): Promise<Career> {
    try {
      logger.log('Creando carrera...', data);

      const response = await apiClient.post<Career>(
        API_ENDPOINTS.CAREERS.CREATE,
        data
      );

      logger.log('Carrera creada exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear carrera:', error);
      throw error;
    }
  },

  /**
   * Actualiza una carrera existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateCareerRequest): Promise<Career> {
    try {
      logger.log('Actualizando carrera...', { id, data });

      const response = await apiClient.put<Career>(
        API_ENDPOINTS.CAREERS.UPDATE(id),
        data
      );

      logger.log('Carrera actualizada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar carrera:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente una carrera (PATCH)
   */
  async patch(id: string, data: Partial<UpdateCareerRequest>): Promise<Career> {
    try {
      logger.log('Actualizando parcialmente carrera...', { id, data });

      const response = await apiClient.patch<Career>(
        API_ENDPOINTS.CAREERS.PATCH(id),
        data
      );

      logger.log('Carrera actualizada parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente carrera:', error);
      throw error;
    }
  },

  /**
   * Elimina una carrera
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando carrera...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.CAREERS.DELETE(id)
      );

      logger.log('Carrera eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar carrera:', error);
      throw error;
    }
  },

  /**
   * Activa una carrera
   */
  async activate(id: string): Promise<Career> {
    try {
      logger.log('Activando carrera...', { id });

      const response = await apiClient.post<Career>(
        API_ENDPOINTS.CAREERS.ACTIVATE(id)
      );

      logger.log('Carrera activada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar carrera:', error);
      throw error;
    }
  },

  /**
   * Desactiva una carrera
   */
  async deactivate(id: string): Promise<Career> {
    try {
      logger.log('Desactivando carrera...', { id });

      const response = await apiClient.post<Career>(
        API_ENDPOINTS.CAREERS.DEACTIVATE(id)
      );

      logger.log('Carrera desactivada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar carrera:', error);
      throw error;
    }
  },
};
