// Tipos para respaldos (copiados del feature, ya que los mocks no pueden importar de features directamente)
export enum BackupStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface Backup {
  id: string;
  name: string;
  description: string | null;
  status: BackupStatus;
  size: number;
  tablesCount: number;
  recordsCount: number;
  createdAt: string;
  completedAt: string | null;
  createdBy: string;
  filePath: string | null;
}

/**
 * Datos mock de respaldos para testing
 */
export const mockBackups: Backup[] = [
  {
    id: '1',
    name: 'Respaldo Completo - Enero 2024',
    description: 'Respaldo completo del sistema',
    status: 'AVAILABLE' as BackupStatus,
    size: 2147483648, // 2GB
    tablesCount: 12,
    recordsCount: 15420,
    createdAt: '2024-01-15T10:30:00.000Z',
    completedAt: '2024-01-15T10:45:00.000Z',
    createdBy: 'admin@example.com',
    filePath: '/backups/backup-2024-01-15.gzip',
  },
  {
    id: '2',
    name: 'Respaldo Completo - Febrero 2024',
    description: 'Respaldo completo del sistema',
    status: 'AVAILABLE' as BackupStatus,
    size: 2281709568, // 2.1GB
    tablesCount: 12,
    recordsCount: 16250,
    createdAt: '2024-02-01T08:00:00.000Z',
    completedAt: '2024-02-01T08:18:00.000Z',
    createdBy: 'admin@example.com',
    filePath: '/backups/backup-2024-02-01.gzip',
  },
  {
    id: '3',
    name: 'Respaldo Completo - Marzo 2024',
    description: 'Respaldo en proceso',
    status: 'IN_PROGRESS' as BackupStatus,
    size: 1048576000, // 1GB (parcial)
    tablesCount: 12,
    recordsCount: 16800,
    createdAt: new Date().toISOString(),
    completedAt: null,
    createdBy: 'admin@example.com',
    filePath: null,
  },
  {
    id: '4',
    name: 'Respaldo Fallido - Diciembre 2023',
    description: 'Error en la creación del respaldo',
    status: 'FAILED' as BackupStatus,
    size: 0,
    tablesCount: 0,
    recordsCount: 0,
    createdAt: '2023-12-15T10:30:00.000Z',
    completedAt: '2023-12-15T10:32:00.000Z',
    createdBy: 'admin@example.com',
    filePath: null,
  },
  {
    id: '5',
    name: 'Respaldo Completo - Noviembre 2023',
    description: 'Respaldo completo del sistema',
    status: 'UNAVAILABLE' as BackupStatus,
    size: 2147483648, // 2GB
    tablesCount: 12,
    recordsCount: 15200,
    createdAt: '2023-11-15T10:30:00.000Z',
    completedAt: '2023-11-15T10:45:00.000Z',
    createdBy: 'admin@example.com',
    filePath: null, // Archivo ya no está disponible
  },
];

/**
 * Encuentra un respaldo por ID
 */
export function findBackupById(id: string): Backup | undefined {
  return mockBackups.find((backup) => backup.id === id);
}

/**
 * Genera un nuevo ID para respaldo
 */
export function generateBackupId(): string {
  const maxId = Math.max(...mockBackups.map((b) => parseInt(b.id, 10)), 0);
  return String(maxId + 1);
}
