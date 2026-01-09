import type { CapturedFields } from '@entities/captured-fields';

/**
 * Datos mock de campos capturados para testing
 */
export const mockCapturedFields: CapturedFields[] = [
  {
    id: '1',
    studentId: '1',
    processDate: new Date('2024-02-15'),
    projectName: 'Sistema de Gestión de Inventarios',
    company: 'Empresa ABC S.A. de C.V.',
    createdAt: new Date('2024-02-15T10:00:00Z'),
    updatedAt: new Date('2024-02-15T10:00:00Z'),
  },
  {
    id: '2',
    studentId: '2',
    processDate: new Date('2024-03-10'),
    projectName: 'Plataforma E-commerce para PYMES',
    company: 'TechSolutions México',
    createdAt: new Date('2024-03-10T10:00:00Z'),
    updatedAt: new Date('2024-03-10T10:00:00Z'),
  },
  {
    id: '3',
    studentId: '1',
    processDate: new Date('2024-01-20'),
    projectName: 'Aplicación móvil de seguimiento de proyectos',
    company: 'Startup Innovations',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-22T10:00:00Z'),
  },
  {
    id: '4',
    studentId: '3',
    processDate: new Date('2024-04-05'),
    projectName: 'Sistema de Control de Calidad',
    company: 'Manufactura Industrial XYZ',
    createdAt: new Date('2024-04-05T10:00:00Z'),
    updatedAt: new Date('2024-04-05T10:00:00Z'),
  },
];

/**
 * Busca campos capturados por ID
 */
export function findCapturedFieldsById(id: string): CapturedFields | undefined {
  return mockCapturedFields.find((fields) => fields.id === id);
}

/**
 * Busca campos capturados por ID de estudiante
 */
export function findCapturedFieldsByStudentId(studentId: string): CapturedFields[] {
  return mockCapturedFields.filter((fields) => fields.studentId === studentId);
}

/**
 * Genera un nuevo ID para campos capturados
 */
export function generateCapturedFieldsId(): string {
  const maxId = Math.max(...mockCapturedFields.map((fields) => parseInt(fields.id, 10)), 0);
  return String(maxId + 1);
}
