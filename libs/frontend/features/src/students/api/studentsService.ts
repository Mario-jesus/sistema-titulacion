import type { Student } from '@entities/student';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListStudentsParams,
  ListStudentsResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Estudiantes
 */
export const studentsService = {
  /**
   * Obtiene la lista de estudiantes con paginación y filtros
   */
  async list(params?: ListStudentsParams): Promise<ListStudentsResponse> {
    try {
      logger.log('Obteniendo lista de estudiantes...', params);

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
      if (params?.search) {
        searchParams.append('search', params.search);
      }
      if (params?.careerId) {
        searchParams.append('careerId', params.careerId);
      }
      if (params?.generationId) {
        searchParams.append('generationId', params.generationId);
      }
      if (params?.status) {
        searchParams.append('status', params.status);
      }
      if (params?.isEgressed !== undefined) {
        searchParams.append('isEgressed', params.isEgressed.toString());
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.STUDENTS.LIST}?${queryString}`
        : API_ENDPOINTS.STUDENTS.LIST;

      const response = await apiClient.get<ListStudentsResponse>(url);

      logger.log('Lista de estudiantes obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un estudiante por ID
   */
  async getById(id: string): Promise<Student> {
    try {
      logger.log('Obteniendo estudiante...', { id });

      const response = await apiClient.get<Student>(
        API_ENDPOINTS.STUDENTS.DETAIL(id)
      );

      logger.log('Estudiante obtenido exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener estudiante:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo estudiante
   */
  async create(data: CreateStudentRequest): Promise<Student> {
    try {
      logger.log('Creando estudiante...', data);

      const response = await apiClient.post<Student>(
        API_ENDPOINTS.STUDENTS.CREATE,
        data
      );

      logger.log('Estudiante creado exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  /**
   * Actualiza un estudiante existente (PUT - reemplazo completo)
   */
  async update(id: string, data: UpdateStudentRequest): Promise<Student> {
    try {
      logger.log('Actualizando estudiante...', { id, data });

      const response = await apiClient.put<Student>(
        API_ENDPOINTS.STUDENTS.UPDATE(id),
        data
      );

      logger.log('Estudiante actualizado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar estudiante:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente un estudiante (PATCH)
   */
  async patch(
    id: string,
    data: Partial<UpdateStudentRequest>
  ): Promise<Student> {
    try {
      logger.log('Actualizando parcialmente estudiante...', { id, data });

      const response = await apiClient.patch<Student>(
        API_ENDPOINTS.STUDENTS.PATCH(id),
        data
      );

      logger.log('Estudiante actualizado parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente estudiante:', error);
      throw error;
    }
  },

  /**
   * Elimina un estudiante
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando estudiante...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.STUDENTS.DELETE(id)
      );

      logger.log('Estudiante eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar estudiante:', error);
      throw error;
    }
  },

  /**
   * Cambia el estado de un estudiante
   */
  async changeStatus(id: string, status: string): Promise<Student> {
    try {
      logger.log('Cambiando estado de estudiante...', { id, status });

      const response = await apiClient.post<Student>(
        API_ENDPOINTS.STUDENTS.CHANGE_STATUS(id),
        { status }
      );

      logger.log('Estado de estudiante cambiado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al cambiar estado de estudiante:', error);
      throw error;
    }
  },
};
