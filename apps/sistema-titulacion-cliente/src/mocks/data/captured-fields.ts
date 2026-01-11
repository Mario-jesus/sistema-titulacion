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
  // CapturedFields para estudiantes en proceso (sin Graduation)
  {
    id: '5',
    studentId: '5',
    processDate: new Date('2024-05-10'),
    projectName: 'Aplicación Web para Gestión de Recursos Humanos',
    company: 'HR Solutions México',
    createdAt: new Date('2024-05-10T10:00:00Z'),
    updatedAt: new Date('2024-05-10T10:00:00Z'),
  },
  {
    id: '6',
    studentId: '6',
    processDate: new Date('2024-05-15'),
    projectName: 'Sistema de Monitoreo de Redes',
    company: 'Network Security Corp',
    createdAt: new Date('2024-05-15T10:00:00Z'),
    updatedAt: new Date('2024-05-15T10:00:00Z'),
  },
  {
    id: '7',
    studentId: '7',
    processDate: new Date('2024-05-20'),
    projectName: 'Plataforma de Aprendizaje en Línea',
    company: 'EduTech Solutions',
    createdAt: new Date('2024-05-20T10:00:00Z'),
    updatedAt: new Date('2024-05-20T10:00:00Z'),
  },
  // CapturedFields para estudiantes titulados
  {
    id: '8',
    studentId: '12',
    processDate: new Date('2024-03-15'),
    projectName: 'Sistema de Análisis de Datos para Investigación',
    company: 'Data Analytics Research Lab',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    updatedAt: new Date('2024-03-15T10:00:00Z'),
  },
  {
    id: '9',
    studentId: '13',
    processDate: new Date('2024-03-20'),
    projectName: 'Desarrollo de Aplicación Móvil para Servicios Financieros',
    company: 'FinTech Solutions México',
    createdAt: new Date('2024-03-20T10:00:00Z'),
    updatedAt: new Date('2024-03-20T10:00:00Z'),
  },
  {
    id: '10',
    studentId: '14',
    processDate: new Date('2024-04-01'),
    projectName: 'Plataforma de Gestión de Exámenes en Línea',
    company: 'Educational Technology Corp',
    createdAt: new Date('2024-04-01T10:00:00Z'),
    updatedAt: new Date('2024-04-01T10:00:00Z'),
  },
  {
    id: '11',
    studentId: '15',
    processDate: new Date('2024-04-10'),
    projectName: 'Sistema de Automatización de Procesos Industriales',
    company: 'Industrial Automation Systems',
    createdAt: new Date('2024-04-10T10:00:00Z'),
    updatedAt: new Date('2024-04-10T10:00:00Z'),
  },
  {
    id: '12',
    studentId: '16',
    processDate: new Date('2024-04-18'),
    projectName: 'Aplicación Web para Gestión de Proyectos de Construcción',
    company: 'Construction Management Solutions',
    createdAt: new Date('2024-04-18T10:00:00Z'),
    updatedAt: new Date('2024-04-18T10:00:00Z'),
  },
  {
    id: '13',
    studentId: '17',
    processDate: new Date('2024-04-25'),
    projectName: 'Sistema de Inteligencia Artificial para Diagnóstico Médico',
    company: 'HealthTech Innovations',
    createdAt: new Date('2024-04-25T10:00:00Z'),
    updatedAt: new Date('2024-04-25T10:00:00Z'),
  },
  {
    id: '14',
    studentId: '18',
    processDate: new Date('2024-05-05'),
    projectName: 'Plataforma de Comercio Electrónico B2B',
    company: 'Business Commerce Platform',
    createdAt: new Date('2024-05-05T10:00:00Z'),
    updatedAt: new Date('2024-05-05T10:00:00Z'),
  },
  // CapturedFields para estudiantes programados (tienen CapturedFields Y Graduation, isGraduated=false)
  {
    id: '19',
    studentId: '19',
    processDate: new Date('2024-03-01'),
    projectName: 'Sistema de Gestión de Proyectos Ágiles',
    company: 'Agile Solutions México',
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-03-01T10:00:00Z'),
  },
  {
    id: '20',
    studentId: '20',
    processDate: new Date('2024-03-05'),
    projectName: 'Plataforma de E-learning Interactiva',
    company: 'EducaTech Solutions',
    createdAt: new Date('2024-03-05T10:00:00Z'),
    updatedAt: new Date('2024-03-05T10:00:00Z'),
  },
  {
    id: '21',
    studentId: '21',
    processDate: new Date('2024-03-10'),
    projectName: 'Sistema de Monitoreo de Calidad Industrial',
    company: 'Quality Control Systems',
    createdAt: new Date('2024-03-10T10:00:00Z'),
    updatedAt: new Date('2024-03-10T10:00:00Z'),
  },
  {
    id: '22',
    studentId: '22',
    processDate: new Date('2024-03-15'),
    projectName: 'Aplicación Móvil de Gestión Financiera',
    company: 'FinTech Innovations',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    updatedAt: new Date('2024-03-15T10:00:00Z'),
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
export function findCapturedFieldsByStudentId(
  studentId: string
): CapturedFields[] {
  return mockCapturedFields.filter((fields) => fields.studentId === studentId);
}

/**
 * Genera un nuevo ID para campos capturados
 */
export function generateCapturedFieldsId(): string {
  const maxId = Math.max(
    ...mockCapturedFields.map((fields) => parseInt(fields.id, 10)),
    0
  );
  return String(maxId + 1);
}
