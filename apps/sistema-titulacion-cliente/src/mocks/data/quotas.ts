import type { Quota } from '@entities/quota';

/**
 * Datos mock de cupos para testing
 */
export const mockQuotas: Quota[] = [
  {
    id: '1',
    generationId: '1',
    careerId: '1',
    newAdmissionQuotas: 50,
    description: 'Cupos para nuevo ingreso de ISC - Generación 2020-2024',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    generationId: '1',
    careerId: '2',
    newAdmissionQuotas: 40,
    description: 'Cupos para nuevo ingreso de LAE - Generación 2020-2024',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    generationId: '2',
    careerId: '1',
    newAdmissionQuotas: 55,
    description: 'Cupos para nuevo ingreso de ISC - Generación 2021-2025',
    isActive: true,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    generationId: '2',
    careerId: '3',
    newAdmissionQuotas: 30,
    description: null,
    isActive: false,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
];

/**
 * Busca un cupo por ID
 */
export function findQuotaById(id: string): Quota | undefined {
  return mockQuotas.find((quota) => quota.id === id);
}

/**
 * Busca cupos por carrera y generación
 */
export function findQuotaByCareerAndGeneration(
  careerId: string,
  generationId: string
): Quota | undefined {
  return mockQuotas.find(
    (quota) =>
      quota.careerId === careerId && quota.generationId === generationId
  );
}

/**
 * Genera un nuevo ID para un cupo
 */
export function generateQuotaId(): string {
  const maxId = Math.max(
    ...mockQuotas.map((quota) => parseInt(quota.id, 10)),
    0
  );
  return String(maxId + 1);
}
