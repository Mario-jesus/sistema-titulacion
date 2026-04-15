import mongoose from 'mongoose';
import { CapturedFieldsModel, StudentModel } from '@backend/students';

/**
 * Campos capturados alineados con `apps/sistema-titulacion-cliente/src/mocks/data/captured-fields.ts`.
 * Requiere `seedStudents` (mismos números de control que el mock de estudiantes).
 *
 * Notas:
 * - El modelo exige un solo registro por estudiante (`studentId` único). En el mock hay dos filas
 *   para el estudiante `1`; aquí se conserva la primera.
 * - Las filas del mock con `studentId` 20–22 no tienen estudiante en `students.seed`; se omiten.
 */
const SEED_CAPTURED_FIELDS: Array<{
  controlNumber: string;
  processDate: Date;
  projectName: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    controlNumber: '20200001',
    processDate: new Date('2024-02-15'),
    projectName: 'Sistema de Gestión de Inventarios',
    company: 'Empresa ABC S.A. de C.V.',
    createdAt: new Date('2024-02-15T10:00:00Z'),
    updatedAt: new Date('2024-02-15T10:00:00Z'),
  },
  {
    controlNumber: '20210002',
    processDate: new Date('2024-03-10'),
    projectName: 'Plataforma E-commerce para PYMES',
    company: 'TechSolutions México',
    createdAt: new Date('2024-03-10T10:00:00Z'),
    updatedAt: new Date('2024-03-10T10:00:00Z'),
  },
  {
    controlNumber: '20200003',
    processDate: new Date('2024-04-05'),
    projectName: 'Sistema de Control de Calidad',
    company: 'Manufactura Industrial XYZ',
    createdAt: new Date('2024-04-05T10:00:00Z'),
    updatedAt: new Date('2024-04-05T10:00:00Z'),
  },
  {
    controlNumber: '20210005',
    processDate: new Date('2024-05-10'),
    projectName: 'Aplicación Web para Gestión de Recursos Humanos',
    company: 'HR Solutions México',
    createdAt: new Date('2024-05-10T10:00:00Z'),
    updatedAt: new Date('2024-05-10T10:00:00Z'),
  },
  {
    controlNumber: '20200006',
    processDate: new Date('2024-05-15'),
    projectName: 'Sistema de Monitoreo de Redes',
    company: 'Network Security Corp',
    createdAt: new Date('2024-05-15T10:00:00Z'),
    updatedAt: new Date('2024-05-15T10:00:00Z'),
  },
  {
    controlNumber: '20200007',
    processDate: new Date('2024-05-20'),
    projectName: 'Plataforma de Aprendizaje en Línea',
    company: 'EduTech Solutions',
    createdAt: new Date('2024-05-20T10:00:00Z'),
    updatedAt: new Date('2024-05-20T10:00:00Z'),
  },
  {
    controlNumber: '20210012',
    processDate: new Date('2024-03-15'),
    projectName: 'Sistema de Análisis de Datos para Investigación',
    company: 'Data Analytics Research Lab',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    updatedAt: new Date('2024-03-15T10:00:00Z'),
  },
  {
    controlNumber: '20200013',
    processDate: new Date('2024-03-20'),
    projectName: 'Desarrollo de Aplicación Móvil para Servicios Financieros',
    company: 'FinTech Solutions México',
    createdAt: new Date('2024-03-20T10:00:00Z'),
    updatedAt: new Date('2024-03-20T10:00:00Z'),
  },
  {
    controlNumber: '20220014',
    processDate: new Date('2024-04-01'),
    projectName: 'Plataforma de Gestión de Exámenes en Línea',
    company: 'Educational Technology Corp',
    createdAt: new Date('2024-04-01T10:00:00Z'),
    updatedAt: new Date('2024-04-01T10:00:00Z'),
  },
  {
    controlNumber: '20210015',
    processDate: new Date('2024-04-10'),
    projectName: 'Sistema de Automatización de Procesos Industriales',
    company: 'Industrial Automation Systems',
    createdAt: new Date('2024-04-10T10:00:00Z'),
    updatedAt: new Date('2024-04-10T10:00:00Z'),
  },
  {
    controlNumber: '20200016',
    processDate: new Date('2024-04-18'),
    projectName: 'Aplicación Web para Gestión de Proyectos de Construcción',
    company: 'Construction Management Solutions',
    createdAt: new Date('2024-04-18T10:00:00Z'),
    updatedAt: new Date('2024-04-18T10:00:00Z'),
  },
  {
    controlNumber: '20210017',
    processDate: new Date('2024-04-25'),
    projectName: 'Sistema de Inteligencia Artificial para Diagnóstico Médico',
    company: 'HealthTech Innovations',
    createdAt: new Date('2024-04-25T10:00:00Z'),
    updatedAt: new Date('2024-04-25T10:00:00Z'),
  },
  {
    controlNumber: '20200018',
    processDate: new Date('2024-05-05'),
    projectName: 'Plataforma de Comercio Electrónico B2B',
    company: 'Business Commerce Platform',
    createdAt: new Date('2024-05-05T10:00:00Z'),
    updatedAt: new Date('2024-05-05T10:00:00Z'),
  },
  {
    controlNumber: '20220019',
    processDate: new Date('2024-03-01'),
    projectName: 'Sistema de Gestión de Proyectos Ágiles',
    company: 'Agile Solutions México',
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-03-01T10:00:00Z'),
  },
];

export async function seedCapturedFields(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const row of SEED_CAPTURED_FIELDS) {
    const student = await StudentModel.findOne({
      controlNumber: row.controlNumber,
    });

    if (!student) {
      console.log(
        `Skipping captured fields for ${row.controlNumber}: student not found. Run students seed first.`
      );
      continue;
    }

    const existing = await CapturedFieldsModel.findOne({
      studentId: student._id,
    });

    if (existing) {
      console.log(
        `Captured fields already exist for student: ${row.controlNumber}`
      );
      continue;
    }

    await CapturedFieldsModel.create({
      studentId: student._id,
      processDate: row.processDate,
      projectName: row.projectName,
      company: row.company,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    console.log(`Created captured fields for student: ${row.controlNumber}`);
  }

  await mongoose.disconnect();
}
