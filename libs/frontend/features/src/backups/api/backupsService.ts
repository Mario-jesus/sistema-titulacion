import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type { Backup, BackupCreateRequest } from '../model/types';
import type { ListBackupsParams, ListBackupsResponse } from '../model/types';

/**
 * Servicio para interactuar con la API de Respaldos
 */
export const backupsService = {
  /**
   * Obtiene la lista de respaldos con paginación y filtros
   */
  async list(params?: ListBackupsParams): Promise<ListBackupsResponse> {
    try {
      logger.log('Obteniendo lista de respaldos...', params);

      const searchParams = new URLSearchParams();

      if (params?.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params?.search) {
        searchParams.append('search', params.search);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.BACKUPS.LIST}?${queryString}`
        : API_ENDPOINTS.BACKUPS.LIST;

      const response = await apiClient.get<ListBackupsResponse>(url);

      logger.log('Lista de respaldos obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de respaldos:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un respaldo por ID
   */
  async getById(id: string): Promise<Backup> {
    try {
      logger.log('Obteniendo respaldo...', { id });

      const response = await apiClient.get<Backup>(
        API_ENDPOINTS.BACKUPS.DETAIL(id)
      );

      logger.log('Respaldo obtenido exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al obtener respaldo:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo respaldo
   */
  async create(data: BackupCreateRequest): Promise<Backup> {
    try {
      logger.log('Creando respaldo...', data);

      const response = await apiClient.post<Backup>(
        API_ENDPOINTS.BACKUPS.CREATE,
        data
      );

      logger.log('Respaldo creado exitosamente', { id: response.id });

      return response;
    } catch (error) {
      logger.error('Error al crear respaldo:', error);
      throw error;
    }
  },

  /**
   * Elimina un respaldo
   */
  async delete(id: string): Promise<void> {
    try {
      logger.log('Eliminando respaldo...', { id });

      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.BACKUPS.DELETE(id)
      );

      logger.log('Respaldo eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar respaldo:', error);
      throw error;
    }
  },

  /**
   * Descarga un archivo de respaldo
   * Nota: La descarga de archivos se maneja directamente en el componente
   * ya que requiere manejar blobs. Este método solo valida que el respaldo esté disponible.
   */
  async download(
    id: string
  ): Promise<{ downloadUrl: string; message: string }> {
    try {
      logger.log('Preparando descarga de respaldo...', { id });

      // Por ahora, solo validamos que el respaldo exista
      // La descarga real se manejará en el componente usando fetch directamente
      await this.getById(id);

      const downloadUrl = API_ENDPOINTS.BACKUPS.DOWNLOAD(id);

      logger.log('Descarga preparada exitosamente', { id });

      return {
        downloadUrl,
        message: 'Descarga iniciada',
      };
    } catch (error) {
      logger.error('Error al preparar descarga de respaldo:', error);
      throw error;
    }
  },

  /**
   * Restaura desde un respaldo existente
   */
  async restore(id: string): Promise<{ message: string; backupId: string }> {
    try {
      logger.log('Restaurando desde respaldo...', { id });

      const response = await apiClient.post<{
        message: string;
        backupId: string;
      }>(API_ENDPOINTS.BACKUPS.RESTORE(id), {});

      logger.log('Restauración iniciada exitosamente', { id });

      return response;
    } catch (error) {
      logger.error('Error al restaurar desde respaldo:', error);
      throw error;
    }
  },

  /**
   * Sube un archivo de respaldo para restaurar
   */
  async upload(file: File): Promise<{ message: string }> {
    try {
      logger.log('Subiendo archivo de respaldo...', { fileName: file.name });

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ message: string }>(
        API_ENDPOINTS.BACKUPS.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      logger.log('Archivo de respaldo subido exitosamente', {
        fileName: file.name,
      });

      return response;
    } catch (error) {
      logger.error('Error al subir archivo de respaldo:', error);
      throw error;
    }
  },
};
