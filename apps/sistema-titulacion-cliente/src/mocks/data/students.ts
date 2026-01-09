import { type Student, Sex, StudentStatus } from '@entities/student';

/**
 * Datos mock de estudiantes para testing
 */
export const mockStudents: Student[] = [
  {
    id: '1',
    careerId: '1',
    generationId: '1',
    controlNumber: '20200001',
    firstName: 'Juan',
    paternalLastName: 'Pérez',
    maternalLastName: 'García',
    phoneNumber: '+52 1234567890',
    email: 'juan.perez@example.com',
    birthDate: new Date('2000-05-15'),
    sex: Sex.MASCULINO,
    isEgressed: true,
    status: StudentStatus.ACTIVO,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    careerId: '1',
    generationId: '2',
    controlNumber: '20210002',
    firstName: 'María',
    paternalLastName: 'López',
    maternalLastName: 'Rodríguez',
    phoneNumber: '+52 0987654321',
    email: 'maria.lopez@example.com',
    birthDate: new Date('2001-08-20'),
    sex: Sex.FEMENINO,
    isEgressed: true,
    status: StudentStatus.ACTIVO,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    careerId: '2',
    generationId: '1',
    controlNumber: '20200003',
    firstName: 'Carlos',
    paternalLastName: 'Martínez',
    maternalLastName: 'Sánchez',
    phoneNumber: '+52 5555555555',
    email: 'carlos.martinez@example.com',
    birthDate: new Date('2000-11-10'),
    sex: Sex.MASCULINO,
    isEgressed: false,
    status: StudentStatus.PAUSADO,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    careerId: '3',
    generationId: '2',
    controlNumber: '20210004',
    firstName: 'Ana',
    paternalLastName: 'González',
    maternalLastName: 'Hernández',
    phoneNumber: '+52 4444444444',
    email: 'ana.gonzalez@example.com',
    birthDate: new Date('2001-03-25'),
    sex: Sex.FEMENINO,
    isEgressed: false,
    status: StudentStatus.CANCELADO,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
];

/**
 * Busca un estudiante por ID
 */
export function findStudentById(id: string): Student | undefined {
  return mockStudents.find((student) => student.id === id);
}

/**
 * Busca un estudiante por número de control
 */
export function findStudentByControlNumber(
  controlNumber: string
): Student | undefined {
  return mockStudents.find(
    (student) => student.controlNumber === controlNumber
  );
}

/**
 * Genera un nuevo ID para un estudiante
 */
export function generateStudentId(): string {
  const maxId = Math.max(
    ...mockStudents.map((student) => parseInt(student.id, 10)),
    0
  );
  return String(maxId + 1);
}

/**
 * Genera un nuevo número de control
 */
export function generateControlNumber(generationId: string): string {
  // Extraer año de la generación (asumiendo formato YYYY en el ID o usando fecha)
  // Por simplicidad, usar año actual
  const year = new Date().getFullYear().toString().slice(2);
  const existingForYear = mockStudents.filter((s) =>
    s.controlNumber.startsWith(year)
  );
  const nextNumber = String(
    (existingForYear.length + 1).toString().padStart(4, '0')
  );
  return `${year}${nextNumber}`;
}
