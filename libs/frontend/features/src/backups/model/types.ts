import type { SearchParams, ListResponse } from '@shared/lib/model';

export enum BackupStatus {
  AVAILABLE = 'AVAILABLE', // Disponible (completado y archivo disponible)
  IN_PROGRESS = 'IN_PROGRESS', // En proceso
  FAILED = 'FAILED', // Fallido
  UNAVAILABLE = 'UNAVAILABLE', // No disponible (el archivo ya no se encuentra en el sistema)
}

export interface Backup {
  id: string;
  name: string;
  description: string | null;
  status: BackupStatus;
  size: number; // en bytes
  tablesCount: number; // número de tablas respaldadas
  recordsCount: number; // número total de registros respaldados
  createdAt: string;
  completedAt: string | null;
  createdBy: string;
  filePath: string | null;
}

export interface BackupCreateRequest {
  name: string;
  description?: string;
}

export interface ListBackupsParams extends SearchParams {
  // No hay filtros adicionales para backups por ahora
}

export type ListBackupsResponse = ListResponse<Backup>;
