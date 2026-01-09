import type { Career } from '@entities/career';
import { findModalityById } from './modalities';

/**
 * Datos mock de carreras para testing
 */
export const mockCareers: Career[] = [
  {
    id: '1',
    name: 'Ingeniería en Sistemas Computacionales',
    shortName: 'ISC',
    modalityId: '1',
    modality: findModalityById('1')!,
    description:
      'Carrera enfocada en el desarrollo de software y sistemas computacionales',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    name: 'Licenciatura en Administración de Empresas',
    shortName: 'LAE',
    modalityId: '2',
    modality: findModalityById('2')!,
    description: 'Carrera orientada a la administración y gestión de empresas',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Ingeniería Industrial',
    shortName: 'II',
    modalityId: '3',
    modality: findModalityById('3')!,
    description: 'Carrera enfocada en la optimización de procesos industriales',
    isActive: true,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    name: 'Ingeniería Electromecánica',
    shortName: 'IEM',
    modalityId: '1',
    modality: findModalityById('4')!,
    description: null,
    isActive: false,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
];

/**
 * Busca una carrera por ID
 */
export function findCareerById(id: string): Career | undefined {
  return mockCareers.find((career) => career.id === id);
}

/**
 * Genera un nuevo ID para una carrera
 */
export function generateCareerId(): string {
  const maxId = Math.max(
    ...mockCareers.map((career) => parseInt(career.id, 10)),
    0
  );
  return String(maxId + 1);
}
