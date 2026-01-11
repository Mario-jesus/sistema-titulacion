import type { Graduation } from '@entities/graduation';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  CreateGraduationRequest,
  UpdateGraduationRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Titulaciones
 */
export const graduationsService = {
  /**
   * Obtiene los detalles de una titulación por ID
   */
  async getById(id: string): Promise<Graduation> {
    try {
      logger.log('Obteniendo titulación...', { id });

      const response = await apiClient.get<Graduation>(
        API_ENDPOINTS.GRADUATIONS.DETAIL(id)
      );

      logger.log('Titulación obtenida exitosamente', { id });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al obtener titulación:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva titulación
   */
  async create(data: CreateGraduationRequest): Promise<Graduation> {
    try {
      logger.log('Creando titulación...', data);

      // Asegurar que graduationDate esté en formato ISO string
      const payload = {
        ...data,
        graduationDate:
          data.graduationDate instanceof Date
            ? data.graduationDate.toISOString()
            : data.graduationDate,
      };

      const response = await apiClient.post<Graduation>(
        API_ENDPOINTS.GRADUATIONS.CREATE,
        payload
      );

      logger.log('Titulación creada exitosamente', { id: response.id });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al crear titulación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una titulación existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateGraduationRequest): Promise<Graduation> {
    try {
      logger.log('Actualizando titulación...', { id, data });

      // Asegurar que graduationDate esté en formato ISO string si se proporciona
      const payload = {
        ...data,
        ...(data.graduationDate && {
          graduationDate:
            data.graduationDate instanceof Date
              ? data.graduationDate.toISOString()
              : data.graduationDate,
        }),
      };

      const response = await apiClient.put<Graduation>(
        API_ENDPOINTS.GRADUATIONS.UPDATE(id),
        payload
      );

      logger.log('Titulación actualizada exitosamente', { id });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al actualizar titulación:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente una titulación (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateGraduationRequest>
  ): Promise<Graduation> {
    try {
      logger.log('Actualizando parcialmente titulación...', { id, data });

      // Asegurar que graduationDate esté en formato ISO string si se proporciona
      const payload = {
        ...data,
        ...(data.graduationDate && {
          graduationDate:
            data.graduationDate instanceof Date
              ? data.graduationDate.toISOString()
              : data.graduationDate,
        }),
      };

      const response = await apiClient.patch<Graduation>(
        API_ENDPOINTS.GRADUATIONS.PATCH(id),
        payload
      );

      logger.log('Titulación actualizada parcialmente exitosamente', { id });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al actualizar parcialmente titulación:', error);
      throw error;
    }
  },

  /**
   * Elimina una titulación
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando titulación...', { id });

      await apiClient.delete(API_ENDPOINTS.GRADUATIONS.DELETE(id));

      logger.log('Titulación eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar titulación:', error);
      throw error;
    }
  },

  /**
   * Marca un estudiante como titulado
   */
  async graduate(idStudent: string): Promise<Graduation> {
    try {
      logger.log('Marcando estudiante como titulado...', { idStudent });

      const response = await apiClient.post<Graduation>(
        API_ENDPOINTS.GRADUATIONS.GRADUATE(idStudent)
      );

      logger.log('Estudiante marcado como titulado exitosamente', {
        idStudent,
      });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al marcar estudiante como titulado:', error);
      throw error;
    }
  },

  /**
   * Desmarca un estudiante como titulado
   */
  async ungraduate(idStudent: string): Promise<Graduation> {
    try {
      logger.log('Desmarcando estudiante como titulado...', { idStudent });

      const response = await apiClient.post<Graduation>(
        API_ENDPOINTS.GRADUATIONS.UNGRADUATE(idStudent)
      );

      logger.log('Estudiante desmarcado como titulado exitosamente', {
        idStudent,
      });

      // Convertir graduationDate de string a Date
      return {
        ...response,
        graduationDate: new Date(response.graduationDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      logger.error('Error al desmarcar estudiante como titulado:', error);
      throw error;
    }
  },
};
