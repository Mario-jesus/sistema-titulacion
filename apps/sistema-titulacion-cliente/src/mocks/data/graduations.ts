import type { Graduation } from '@entities/graduation';

/**
 * Datos mock de titulaciones para testing - Actualizados con nueva estructura
 */
export const mockGraduations: Graduation[] = [
  // Estudiantes programados (con scheduledDate pero sin graduationDate)
  {
    id: 'grad-4',
    studentId: '4',
    graduationOptionId: '1',
    scheduledDate: new Date('2024-12-15T14:30:00Z'),
    president: 'Dr. Carlos Ramírez García',
    secretary: 'Mtra. Ana Martínez López',
    vocal: 'Ing. Luis Sánchez Pérez',
    substituteVocal: 'Dra. María González Hernández',
    notes: 'Programado para titulación en diciembre 2024.',
    createdAt: new Date('2024-01-18T11:45:00Z'),
    updatedAt: new Date('2024-01-18T11:45:00Z'),
  },
  {
    id: 'grad-5',
    studentId: '5',
    graduationOptionId: '2',
    scheduledDate: new Date('2025-01-20T16:00:00Z'),
    president: 'Dra. Laura Fernández Torres',
    secretary: 'Dr. Roberto Morales Díaz',
    vocal: 'Mtra. Patricia Rivera Silva',
    substituteVocal: 'Ing. Juan Carlos Méndez',
    notes: 'Programado para titulación en enero 2025.',
    createdAt: new Date('2024-02-25T16:20:00Z'),
    updatedAt: new Date('2024-02-25T16:20:00Z'),
  },
  {
    id: 'grad-15',
    studentId: '15',
    graduationOptionId: '1',
    scheduledDate: new Date('2024-11-30T10:00:00Z'),
    president: 'Dr. Miguel Ángel Torres',
    secretary: 'Mtra. Carmen Patricia Reyes',
    vocal: 'Ing. Roberto Díaz Morales',
    substituteVocal: 'Dra. Sofía Hernández López',
    notes: 'Programado para titulación en noviembre 2024.',
    createdAt: new Date('2024-03-12T14:00:00Z'),
    updatedAt: new Date('2024-03-12T14:00:00Z'),
  },
  {
    id: 'grad-16',
    studentId: '16',
    graduationOptionId: '2',
    scheduledDate: new Date('2024-12-10T15:30:00Z'),
    president: 'Dra. María Luisa González',
    secretary: 'Dr. José Antonio Martínez',
    vocal: 'Mtra. Patricia Silva Reyes',
    substituteVocal: 'Ing. Carlos Fernando López',
    notes: 'Programado para titulación en diciembre 2024.',
    createdAt: new Date('2024-04-08T10:30:00Z'),
    updatedAt: new Date('2024-04-08T10:30:00Z'),
  },

  // Estudiantes titulados (con graduationDate y datos de cédula)
  {
    id: 'grad-6',
    studentId: '6',
    graduationOptionId: '1',
    graduationDate: new Date('2024-10-15T10:00:00Z'),
    president: 'Dr. Miguel Ángel Torres',
    secretary: 'Mtra. Carmen Patricia Reyes',
    vocal: 'Ing. Roberto Díaz Morales',
    substituteVocal: 'Dra. Sofía Hernández López',
    notes:
      'Titulada con mención honorífica. Proyecto de tesis sobre IA aplicada a medicina.',
    idCardNumber: 'CED-2024-001234',
    idCardIssueDate: new Date('2024-10-20T09:00:00Z'),
    createdAt: new Date('2024-01-30T13:00:00Z'),
    updatedAt: new Date('2024-10-20T09:00:00Z'),
  },
  {
    id: 'grad-7',
    studentId: '7',
    graduationOptionId: '2',
    graduationDate: new Date('2024-09-10T15:30:00Z'),
    president: 'Dra. María Luisa González',
    secretary: 'Dr. José Antonio Martínez',
    vocal: 'Mtra. Patricia Silva Reyes',
    substituteVocal: 'Ing. Carlos Fernando López',
    notes:
      'Titulado por proyecto profesional. Desarrollo de sistema de gestión empresarial.',
    idCardNumber: 'CED-2024-005678',
    idCardIssueDate: new Date('2024-09-15T11:00:00Z'),
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-09-15T11:00:00Z'),
  },
  {
    id: 'grad-17',
    studentId: '17',
    graduationOptionId: '1',
    graduationDate: new Date('2024-08-20T14:00:00Z'),
    president: 'Dr. Carlos Ramírez García',
    secretary: 'Mtra. Ana Martínez López',
    vocal: 'Ing. Luis Sánchez Pérez',
    substituteVocal: 'Dra. María González Hernández',
    notes: 'Titulada por tesis. Investigación sobre tecnologías educativas.',
    idCardNumber: 'CED-2024-009012',
    idCardIssueDate: new Date('2024-08-25T10:30:00Z'),
    createdAt: new Date('2024-02-20T09:00:00Z'),
    updatedAt: new Date('2024-08-25T10:30:00Z'),
  },
  {
    id: 'grad-18',
    studentId: '18',
    graduationOptionId: '2',
    graduationDate: new Date('2024-07-05T11:00:00Z'),
    president: 'Dra. Laura Fernández Torres',
    secretary: 'Dr. Roberto Morales Díaz',
    vocal: 'Mtra. Patricia Rivera Silva',
    substituteVocal: 'Ing. Juan Carlos Méndez',
    notes:
      'Titulado por proyecto profesional. Sistema de gestión de inventarios.',
    idCardNumber: 'CED-2024-003456',
    idCardIssueDate: new Date('2024-07-10T08:00:00Z'),
    createdAt: new Date('2024-01-05T14:20:00Z'),
    updatedAt: new Date('2024-07-10T08:00:00Z'),
  },
  {
    id: 'grad-19',
    studentId: '19',
    graduationOptionId: '1',
    graduationDate: new Date('2024-06-14T16:30:00Z'),
    president: 'Dr. Miguel Ángel Torres',
    secretary: 'Mtra. Carmen Patricia Reyes',
    vocal: 'Ing. Roberto Díaz Morales',
    substituteVocal: 'Dra. Sofía Hernández López',
    notes:
      'Titulada con mención honorífica. Proyecto sobre sostenibilidad ambiental.',
    idCardNumber: 'CED-2024-007890',
    idCardIssueDate: new Date('2024-06-20T12:00:00Z'),
    createdAt: new Date('2024-03-14T11:30:00Z'),
    updatedAt: new Date('2024-06-20T12:00:00Z'),
  },

  // Estudiantes en proceso (sin datos de graduación)
  // Los estudiantes 1, 2, 3, 12, 13, 14 no tienen registros de graduación
];

// Funciones auxiliares para los mocks
export const findGraduationByStudentId = (
  studentId: string
): Graduation | undefined => {
  return mockGraduations.find(
    (graduation) => graduation.studentId === studentId
  );
};

export const findGraduationById = (id: string): Graduation | undefined => {
  return mockGraduations.find((graduation) => graduation.id === id);
};

export const generateGraduationId = (): string => {
  const maxId = Math.max(
    ...mockGraduations.map((g) => parseInt(g.id.replace('grad-', '')))
  );
  return `grad-${maxId + 1}`;
};
