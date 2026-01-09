import type { Graduation } from '@entities/graduation';

/**
 * Datos mock de titulaciones para testing
 */
export const mockGraduations: Graduation[] = [
  {
    id: '1',
    studentId: '1',
    graduationOptionId: '1',
    date: new Date('2024-06-15'),
    isGraduated: true,
    president: 'Dr. Carlos Ramírez García',
    secretary: 'Mtra. Ana Martínez López',
    vocal: 'Ing. Luis Sánchez Pérez',
    substituteVocal: 'Dra. María González Hernández',
    notes: 'Titulación por tesis. Excelente desempeño en el proyecto.',
    createdAt: new Date('2024-06-15T10:00:00Z'),
    updatedAt: new Date('2024-06-15T10:00:00Z'),
  },
  {
    id: '2',
    studentId: '2',
    graduationOptionId: '2',
    date: new Date('2024-07-20'),
    isGraduated: true,
    president: 'Dra. Laura Fernández Torres',
    secretary: 'Dr. Roberto Morales Díaz',
    vocal: 'Mtra. Patricia Rivera Silva',
    substituteVocal: 'Ing. Juan Carlos Méndez',
    notes:
      'Titulación por residencia profesional. Proyecto implementado exitosamente.',
    createdAt: new Date('2024-07-20T10:00:00Z'),
    updatedAt: new Date('2024-07-25T10:00:00Z'),
  },
  {
    id: '3',
    studentId: '3',
    graduationOptionId: '1',
    date: new Date('2024-08-10'),
    isGraduated: false,
    president: 'Dr. Fernando Jiménez Ruiz',
    secretary: 'Mtra. Gabriela Soto Vázquez',
    vocal: 'Ing. Jorge Campos Mendoza',
    substituteVocal: 'Dra. Claudia Rojas Martínez',
    notes: null,
    createdAt: new Date('2024-08-10T10:00:00Z'),
    updatedAt: new Date('2024-08-10T10:00:00Z'),
  },
];

/**
 * Busca una titulación por ID
 */
export function findGraduationById(id: string): Graduation | undefined {
  return mockGraduations.find((graduation) => graduation.id === id);
}

/**
 * Busca titulaciones por ID de estudiante
 */
export function findGraduationByStudentId(
  studentId: string
): Graduation | undefined {
  return mockGraduations.find(
    (graduation) => graduation.studentId === studentId
  );
}

/**
 * Genera un nuevo ID para una titulación
 */
export function generateGraduationId(): string {
  const maxId = Math.max(
    ...mockGraduations.map((graduation) => parseInt(graduation.id, 10)),
    0
  );
  return String(maxId + 1);
}
