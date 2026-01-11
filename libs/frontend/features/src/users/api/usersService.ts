import type { User } from '@entities/user/model';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListUsersParams,
  ListUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Usuarios
 */
export const usersService = {
  /**
   * Obtiene la lista de usuarios con paginación y filtros (solo ADMIN)
   */
  async list(params?: ListUsersParams): Promise<ListUsersResponse> {
    try {
      logger.log('Obteniendo lista de usuarios...', params);

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
      if (params?.role) {
        searchParams.append('role', params.role);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.USERS.LIST}?${queryString}`
        : API_ENDPOINTS.USERS.LIST;

      const response = await apiClient.get<ListUsersResponse>(url);

      logger.log('Lista de usuarios obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un usuario por ID
   */
  async getById(id: string): Promise<User> {
    try {
      logger.log('Obteniendo usuario...', { id });

      const response = await apiClient.get<User>(
        API_ENDPOINTS.USERS.DETAIL(id)
      );

      logger.log('Usuario obtenido exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo usuario (solo ADMIN)
   */
  async create(data: CreateUserRequest): Promise<User> {
    try {
      logger.log('Creando usuario...', { username: data.username });

      const response = await apiClient.post<User>(
        API_ENDPOINTS.USERS.CREATE,
        data
      );

      logger.log('Usuario creado exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      throw error;
    }
  },

  /**
   * Actualiza un usuario existente (PUT - reemplazo completo, solo ADMIN)
   */
  async update(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      logger.log('Actualizando usuario...', { id, data });

      const response = await apiClient.put<User>(
        API_ENDPOINTS.USERS.UPDATE(id),
        data
      );

      logger.log('Usuario actualizado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  /**
   * Actualiza parcialmente un usuario (PATCH, solo ADMIN)
   */
  async patch(id: string, data: Partial<UpdateUserRequest>): Promise<User> {
    try {
      logger.log('Actualizando parcialmente usuario...', { id, data });

      const response = await apiClient.patch<User>(
        API_ENDPOINTS.USERS.PATCH(id),
        data
      );

      logger.log('Usuario actualizado parcialmente exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al actualizar parcialmente usuario:', error);
      throw error;
    }
  },

  /**
   * Elimina un usuario (solo ADMIN)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando usuario...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.USERS.DELETE(id)
      );

      logger.log('Usuario eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  /**
   * Activa un usuario (solo ADMIN)
   */
  async activate(id: string): Promise<User> {
    try {
      logger.log('Activando usuario...', { id });

      const response = await apiClient.post<User>(
        API_ENDPOINTS.USERS.ACTIVATE(id)
      );

      logger.log('Usuario activado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al activar usuario:', error);
      throw error;
    }
  },

  /**
   * Desactiva un usuario (solo ADMIN)
   */
  async deactivate(id: string): Promise<User> {
    try {
      logger.log('Desactivando usuario...', { id });

      const response = await apiClient.post<User>(
        API_ENDPOINTS.USERS.DEACTIVATE(id)
      );

      logger.log('Usuario desactivado exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al desactivar usuario:', error);
      throw error;
    }
  },

  /**
   * Cambia la contraseña de un usuario
   * - Si es usuario propio: requiere currentPassword
   * - Si es admin cambiando contraseña de otro: no requiere currentPassword
   */
  async changePassword(
    id: string,
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    try {
      logger.log('Cambiando contraseña de usuario...', { id });

      const response = await apiClient.post<{ message: string }>(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD(id),
        data
      );

      logger.log('Contraseña cambiada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },
};
