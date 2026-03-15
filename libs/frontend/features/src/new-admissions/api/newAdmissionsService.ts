import type { NewAdmission } from '@entities/new-admission';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListNewAdmissionsParams,
  ListNewAdmissionsResponse,
  CreateNewAdmissionRequest,
  UpdateNewAdmissionRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Nuevo Ingreso
 */
export const newAdmissionsService = {
  async list(
    params?: ListNewAdmissionsParams
  ): Promise<ListNewAdmissionsResponse> {
    try {
      logger.log('Obteniendo lista de registros de ingreso...', params);

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
        ? `${API_ENDPOINTS.NEW_ADMISSIONS.LIST}?${queryString}`
        : API_ENDPOINTS.NEW_ADMISSIONS.LIST;

      const response = await apiClient.get<ListNewAdmissionsResponse>(url);

      logger.log('Lista de registros de ingreso obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de registros de ingreso:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<NewAdmission> {
    try {
      logger.log('Obteniendo registro de ingreso...', { id });

      const response = await apiClient.get<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.DETAIL(id)
      );

      logger.log('Registro de ingreso obtenido exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener registro de ingreso:', error);
      throw error;
    }
  },

  async create(data: CreateNewAdmissionRequest): Promise<NewAdmission> {
    try {
      logger.log('Creando registro de ingreso...', data);

      const response = await apiClient.post<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.CREATE,
        data
      );

      logger.log('Registro de ingreso creado exitosamente', {
        id: response.id,
      });

      return response;
    } catch (error) {
      logger.error('Error al crear registro de ingreso:', error);
      throw error;
    }
  },

  async update(
    id: string,
    data: UpdateNewAdmissionRequest
  ): Promise<NewAdmission> {
    try {
      logger.log('Actualizando registro de ingreso...', { id, data });

      const response = await apiClient.put<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.UPDATE(id),
        data
      );

      logger.log('Registro de ingreso actualizado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar registro de ingreso:', error);
      throw error;
    }
  },

  async patch(
    id: string,
    data: Partial<UpdateNewAdmissionRequest>
  ): Promise<NewAdmission> {
    try {
      logger.log('Actualizando parcialmente registro de ingreso...', {
        id,
        data,
      });

      const response = await apiClient.patch<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.PATCH(id),
        data
      );

      logger.log('Registro de ingreso actualizado parcialmente exitosamente', {
        id,
      });

      return response;
    } catch (error) {
      logger.error(
        'Error al actualizar parcialmente registro de ingreso:',
        error
      );
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando registro de ingreso...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.NEW_ADMISSIONS.DELETE(id)
      );

      logger.log('Registro de ingreso eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar registro de ingreso:', error);
      throw error;
    }
  },

  async activate(id: string): Promise<NewAdmission> {
    try {
      logger.log('Activando registro de ingreso...', { id });

      const response = await apiClient.post<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.ACTIVATE(id)
      );

      logger.log('Registro de ingreso activado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar registro de ingreso:', error);
      throw error;
    }
  },

  async deactivate(id: string): Promise<NewAdmission> {
    try {
      logger.log('Desactivando registro de ingreso...', { id });

      const response = await apiClient.post<NewAdmission>(
        API_ENDPOINTS.NEW_ADMISSIONS.DEACTIVATE(id)
      );

      logger.log('Registro de ingreso desactivado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar registro de ingreso:', error);
      throw error;
    }
  },
};
