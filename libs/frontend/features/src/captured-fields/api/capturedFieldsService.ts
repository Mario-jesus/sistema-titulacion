import type { CapturedFields } from '@entities/captured-fields';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  CreateCapturedFieldsRequest,
  UpdateCapturedFieldsRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Campos Capturados
 */
export const capturedFieldsService = {
  /**
   * Obtiene los detalles de campos capturados por ID
   */
  async getById(id: string): Promise<CapturedFields> {
    try {
      logger.log('Obteniendo campos capturados...', { id });

      const response = await apiClient.get<CapturedFields>(
        API_ENDPOINTS.CAPTURED_FIELDS.DETAIL(id)
      );

      logger.log('Campos capturados obtenidos exitosamente', { id });

      // Convertir processDate de string a Date
      return {
        ...response,
        processDate: new Date(response.processDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al obtener campos capturados:', error);
      throw error;
    }
  },

  /**
   * Crea nuevos campos capturados
   */
  async create(data: CreateCapturedFieldsRequest): Promise<CapturedFields> {
    try {
      logger.log('Creando campos capturados...', data);

      // Asegurar que processDate esté en formato ISO string
      const payload = {
        ...data,
        processDate:
          data.processDate instanceof Date
            ? data.processDate.toISOString().split('T')[0] // Solo fecha, sin hora
            : data.processDate,
      };

      const response = await apiClient.post<CapturedFields>(
        API_ENDPOINTS.CAPTURED_FIELDS.CREATE,
        payload
      );

      logger.log('Campos capturados creados exitosamente', {
        id: response.id,
      });

      // Convertir processDate de string a Date
      return {
        ...response,
        processDate: new Date(response.processDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al crear campos capturados:', error);
      throw error;
    }
  },

  /**
   * Actualiza campos capturados existentes (PUT - reemplazo completo)
   */
  async update(
    id: string,
    data: UpdateCapturedFieldsRequest
  ): Promise<CapturedFields> {
    try {
      logger.log('Actualizando campos capturados...', { id, data });

      // Asegurar que processDate esté en formato ISO string si se proporciona
      const payload = {
        ...data,
        ...(data.processDate && {
          processDate:
            data.processDate instanceof Date
              ? data.processDate.toISOString().split('T')[0] // Solo fecha, sin hora
              : data.processDate,
        }),
      };

      const response = await apiClient.put<CapturedFields>(
        API_ENDPOINTS.CAPTURED_FIELDS.UPDATE(id),
        payload
      );

      logger.log('Campos capturados actualizados exitosamente', { id });

      // Convertir processDate de string a Date
      return {
        ...response,
        processDate: new Date(response.processDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al actualizar campos capturados:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente campos capturados (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateCapturedFieldsRequest>
  ): Promise<CapturedFields> {
    try {
      logger.log('Actualizando parcialmente campos capturados...', {
        id,
        data,
      });

      // Asegurar que processDate esté en formato ISO string si se proporciona
      const payload = {
        ...data,
        ...(data.processDate && {
          processDate:
            data.processDate instanceof Date
              ? data.processDate.toISOString().split('T')[0] // Solo fecha, sin hora
              : data.processDate,
        }),
      };

      const response = await apiClient.patch<CapturedFields>(
        API_ENDPOINTS.CAPTURED_FIELDS.PATCH(id),
        payload
      );

      logger.log('Campos capturados actualizados parcialmente exitosamente', {
        id,
      });

      // Convertir processDate de string a Date
      return {
        ...response,
        processDate: new Date(response.processDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error(
        'Error al actualizar parcialmente campos capturados:',
        error
      );
      throw error;
    }
  },

  /**
   * Elimina campos capturados
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando campos capturados...', { id });

      await apiClient.delete(API_ENDPOINTS.CAPTURED_FIELDS.DELETE(id));

      logger.log('Campos capturados eliminados exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar campos capturados:', error);
      throw error;
    }
  },
};
