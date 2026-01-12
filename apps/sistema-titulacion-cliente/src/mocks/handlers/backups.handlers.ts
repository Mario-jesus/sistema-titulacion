import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@shared/api';
import { buildApiUrl, delay } from '../utils';
import {
  mockBackups,
  findBackupById,
  generateBackupId,
  type Backup,
  type BackupStatus,
} from '../data';

/**
 * Handlers para endpoints de respaldos
 */

interface CreateBackupRequest {
  name: string;
  description?: string;
}

interface PaginationData {
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface ListResponse {
  data: Backup[];
  pagination: PaginationData;
}

export const backupsHandlers = [
  // GET /backups (List)
  http.get(buildApiUrl(API_ENDPOINTS.BACKUPS.LIST), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;
    const search =
      url.searchParams.get('search') || url.searchParams.get('q') || '';

    // Filtrar por búsqueda
    let filteredBackups = [...mockBackups];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBackups = filteredBackups.filter(
        (backup) =>
          backup.name.toLowerCase().includes(searchLower) ||
          (backup.description &&
            backup.description.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredBackups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginación
    const total = filteredBackups.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = filteredBackups.slice(offset, offset + limit);

    return HttpResponse.json<ListResponse>({
      data: paginatedData,
      pagination: {
        total,
        limit,
        totalPages,
        page,
        pagingCounter: offset + 1,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    });
  }),

  // GET /backups/:id (Detail)
  http.get(
    buildApiUrl(API_ENDPOINTS.BACKUPS.DETAIL(':id')),
    async ({ params }) => {
      await delay(200);

      const id = params.id as string;
      const backup = findBackupById(id);

      if (!backup) {
        return HttpResponse.json(
          {
            error: 'Respaldo no encontrado',
            code: 'BACKUP_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      return HttpResponse.json<Backup>(backup);
    }
  ),

  // POST /backups (Create)
  http.post(buildApiUrl(API_ENDPOINTS.BACKUPS.CREATE), async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateBackupRequest;

    if (!body.name || !body.name.trim()) {
      return HttpResponse.json(
        {
          error: 'El nombre del respaldo es requerido',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Crear nuevo respaldo
    const newBackup: Backup = {
      id: generateBackupId(),
      name: body.name.trim(),
      description: body.description?.trim() || null,
      status: 'IN_PROGRESS' as BackupStatus,
      size: 0,
      tablesCount: 0,
      recordsCount: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      createdBy: 'admin@example.com', // En producción, obtener del token
      filePath: null,
    };

    // Agregar al inicio del array
    mockBackups.unshift(newBackup);

    return HttpResponse.json<Backup>(newBackup, { status: 201 });
  }),

  // DELETE /backups/:id (Delete)
  http.delete(
    buildApiUrl(API_ENDPOINTS.BACKUPS.DELETE(':id')),
    async ({ params }) => {
      await delay(300);

      const id = params.id as string;
      const index = mockBackups.findIndex((backup) => backup.id === id);

      if (index === -1) {
        return HttpResponse.json(
          {
            error: 'Respaldo no encontrado',
            code: 'BACKUP_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      mockBackups.splice(index, 1);

      return HttpResponse.json({ message: 'Respaldo eliminado exitosamente' });
    }
  ),

  // GET /backups/:id/download (Download)
  http.get(
    buildApiUrl(API_ENDPOINTS.BACKUPS.DOWNLOAD(':id')),
    async ({ params }) => {
      await delay(500);

      const id = params.id as string;
      const backup = findBackupById(id);

      if (!backup) {
        return HttpResponse.json(
          {
            error: 'Respaldo no encontrado',
            code: 'BACKUP_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (backup.status !== 'AVAILABLE' || !backup.filePath) {
        return HttpResponse.json(
          {
            error: 'El respaldo no está disponible para descargar',
            code: 'BACKUP_NOT_AVAILABLE',
          },
          { status: 400 }
        );
      }

      // Simular descarga (en producción devolvería el archivo real)
      // Por ahora devolvemos un objeto con la información
      return HttpResponse.json({
        message: 'Descarga iniciada',
        downloadUrl: `/api/v1${backup.filePath}`,
      });
    }
  ),

  // POST /backups/:id/restore (Restore)
  http.post(
    buildApiUrl(API_ENDPOINTS.BACKUPS.RESTORE(':id')),
    async ({ params, request }) => {
      await delay(300);

      const id = params.id as string;
      const backup = findBackupById(id);

      if (!backup) {
        return HttpResponse.json(
          {
            error: 'Respaldo no encontrado',
            code: 'BACKUP_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (backup.status !== 'AVAILABLE') {
        return HttpResponse.json(
          {
            error: 'El respaldo no está disponible para restaurar',
            code: 'BACKUP_NOT_AVAILABLE',
          },
          { status: 400 }
        );
      }

      // En producción, aquí se iniciaría el proceso de restauración
      return HttpResponse.json({
        message: 'Restauración iniciada',
        backupId: id,
      });
    }
  ),

  // POST /backups/upload (Upload file for restore)
  http.post(buildApiUrl(API_ENDPOINTS.BACKUPS.UPLOAD), async ({ request }) => {
    await delay(1000);

    // En producción, aquí se procesaría el archivo subido
    // Por ahora simulamos la subida y restauración
    return HttpResponse.json(
      {
        message: 'Archivo subido y restauración iniciada',
      },
      { status: 201 }
    );
  }),
];
