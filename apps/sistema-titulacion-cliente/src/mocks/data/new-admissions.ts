import type { NewAdmission } from '@entities/new-admission';

/**
 * Datos mock de registros de nuevo ingreso para testing
 */
export const mockNewAdmissions: NewAdmission[] = [
  {
    id: '1',
    generationId: '1',
    careerId: '1',
    maleCount: 7,
    femaleCount: 5,
    description: 'Registro de nuevo ingreso de ISC - Generación 2020-2024',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    generationId: '1',
    careerId: '2',
    maleCount: 4,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de LAE - Generación 2020-2024',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    generationId: '2',
    careerId: '1',
    maleCount: 6,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de ISC - Generación 2021-2025',
    isActive: true,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    generationId: '2',
    careerId: '3',
    maleCount: 3,
    femaleCount: 3,
    description: null,
    isActive: false,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
  {
    id: '5',
    generationId: '1',
    careerId: '3',
    maleCount: 4,
    femaleCount: 3,
    description: 'Registro de nuevo ingreso de II - Generación 2020-2024',
    isActive: true,
    createdAt: new Date('2024-01-19T10:00:00Z'),
    updatedAt: new Date('2024-01-19T10:00:00Z'),
  },
  {
    id: '6',
    generationId: '2',
    careerId: '2',
    maleCount: 5,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de LAE - Generación 2021-2025',
    isActive: true,
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
  {
    id: '7',
    generationId: '3',
    careerId: '1',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2022-2026',
    isActive: true,
    createdAt: new Date('2024-01-21T10:00:00Z'),
    updatedAt: new Date('2024-01-21T10:00:00Z'),
  },
  {
    id: '8',
    generationId: '3',
    careerId: '2',
    maleCount: 1,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2022-2026',
    isActive: true,
    createdAt: new Date('2024-01-22T10:00:00Z'),
    updatedAt: new Date('2024-01-22T10:00:00Z'),
  },
  {
    id: '9',
    generationId: '3',
    careerId: '3',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2022-2026',
    isActive: true,
    createdAt: new Date('2024-01-23T10:00:00Z'),
    updatedAt: new Date('2024-01-23T10:00:00Z'),
  },
  {
    id: '10',
    generationId: '4',
    careerId: '1',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de ISC - Generación 2019-2023',
    isActive: true,
    createdAt: new Date('2024-01-24T10:00:00Z'),
    updatedAt: new Date('2024-01-24T10:00:00Z'),
  },
  {
    id: '11',
    generationId: '4',
    careerId: '2',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2019-2023',
    isActive: true,
    createdAt: new Date('2024-01-25T10:00:00Z'),
    updatedAt: new Date('2024-01-25T10:00:00Z'),
  },
  {
    id: '12',
    generationId: '4',
    careerId: '3',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de II - Generación 2019-2023',
    isActive: true,
    createdAt: new Date('2024-01-26T10:00:00Z'),
    updatedAt: new Date('2024-01-26T10:00:00Z'),
  },
  {
    id: '13',
    generationId: '5',
    careerId: '1',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2018-2022',
    isActive: true,
    createdAt: new Date('2024-01-27T10:00:00Z'),
    updatedAt: new Date('2024-01-27T10:00:00Z'),
  },
  {
    id: '14',
    generationId: '5',
    careerId: '2',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de LAE - Generación 2018-2022',
    isActive: true,
    createdAt: new Date('2024-01-28T10:00:00Z'),
    updatedAt: new Date('2024-01-28T10:00:00Z'),
  },
  {
    id: '15',
    generationId: '5',
    careerId: '3',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2018-2022',
    isActive: true,
    createdAt: new Date('2024-01-29T10:00:00Z'),
    updatedAt: new Date('2024-01-29T10:00:00Z'),
  },
  {
    id: '16',
    generationId: '6',
    careerId: '1',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de ISC - Generación 2017-2021',
    isActive: true,
    createdAt: new Date('2024-01-30T10:00:00Z'),
    updatedAt: new Date('2024-01-30T10:00:00Z'),
  },
  {
    id: '17',
    generationId: '6',
    careerId: '2',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2017-2021',
    isActive: true,
    createdAt: new Date('2024-01-31T10:00:00Z'),
    updatedAt: new Date('2024-01-31T10:00:00Z'),
  },
  {
    id: '18',
    generationId: '6',
    careerId: '3',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de II - Generación 2017-2021',
    isActive: true,
    createdAt: new Date('2024-02-01T10:00:00Z'),
    updatedAt: new Date('2024-02-01T10:00:00Z'),
  },
  {
    id: '19',
    generationId: '7',
    careerId: '1',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2023-2027',
    isActive: true,
    createdAt: new Date('2024-02-02T10:00:00Z'),
    updatedAt: new Date('2024-02-02T10:00:00Z'),
  },
  {
    id: '20',
    generationId: '7',
    careerId: '2',
    maleCount: 1,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2023-2027',
    isActive: true,
    createdAt: new Date('2024-02-03T10:00:00Z'),
    updatedAt: new Date('2024-02-03T10:00:00Z'),
  },
  {
    id: '21',
    generationId: '7',
    careerId: '3',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2023-2027',
    isActive: true,
    createdAt: new Date('2024-02-04T10:00:00Z'),
    updatedAt: new Date('2024-02-04T10:00:00Z'),
  },
];

/**
 * Busca un registro de ingreso por ID
 */
export function findNewAdmissionById(id: string): NewAdmission | undefined {
  return mockNewAdmissions.find((entry) => entry.id === id);
}

/**
 * Busca registros de ingreso por carrera y generación
 */
export function findNewAdmissionByCareerAndGeneration(
  careerId: string,
  generationId: string
): NewAdmission | undefined {
  return mockNewAdmissions.find(
    (entry) =>
      entry.careerId === careerId && entry.generationId === generationId
  );
}

/**
 * Genera un nuevo ID para un registro de ingreso
 */
export function generateNewAdmissionId(): string {
  const maxId = Math.max(
    ...mockNewAdmissions.map((entry) => parseInt(entry.id, 10)),
    0
  );
  return String(maxId + 1);
}
