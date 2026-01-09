import type { Generation } from '@entities/generation';

/**
 * Datos mock de generaciones para testing
 */
export const mockGenerations: Generation[] = [
  {
    id: '1',
    name: 'Generación 2020-2024',
    startYear: new Date('2020-08-01T00:00:00Z'),
    endYear: new Date('2024-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2020',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    name: 'Generación 2021-2025',
    startYear: new Date('2021-08-01T00:00:00Z'),
    endYear: new Date('2025-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2021',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Generación 2022-2026',
    startYear: new Date('2022-08-01T00:00:00Z'),
    endYear: new Date('2026-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2022',
    isActive: true,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    name: 'Generación 2019-2023',
    startYear: new Date('2019-08-01T00:00:00Z'),
    endYear: new Date('2023-07-31T23:59:59Z'),
    description: null,
    isActive: false,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
];

/**
 * Busca una generación por ID
 */
export function findGenerationById(id: string): Generation | undefined {
  return mockGenerations.find((generation) => generation.id === id);
}

/**
 * Genera un nuevo ID para una generación
 */
export function generateGenerationId(): string {
  const maxId = Math.max(...mockGenerations.map((gen) => parseInt(gen.id, 10)), 0);
  return String(maxId + 1);
}
