import type { Modality } from '@entities/modality';

/**
 * Datos mock de modalidades para testing
 */
export const mockModalities: Modality[] = [
  {
    id: '1',
    name: 'Presencial',
    description: 'Modalidad presencial tradicional',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    name: 'En Línea',
    description: 'Modalidad completamente en línea',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Mixta',
    description: 'Modalidad híbrida, combinando presencial y en línea',
    isActive: true,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    name: 'Sabatina',
    description: null,
    isActive: false,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
];

/**
 * Busca una modalidad por ID
 */
export function findModalityById(id: string): Modality | undefined {
  return mockModalities.find((modality) => modality.id === id);
}

/**
 * Genera un nuevo ID para una modalidad
 */
export function generateModalityId(): string {
  const maxId = Math.max(...mockModalities.map((mod) => parseInt(mod.id, 10)), 0);
  return String(maxId + 1);
}
