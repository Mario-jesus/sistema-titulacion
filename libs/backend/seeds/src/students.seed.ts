import mongoose from 'mongoose';
import { CareerModel } from '@backend/careers';
import { GenerationModel } from '@backend/generations';
import { StudentModel } from '@backend/students';
import type {
  ProcessStatus,
  Sex,
  StudentStatus,
} from '@backend/students/models/Student.model.js';

/**
 * Estudiantes alineados con mocks del cliente (students.ts).
 * Requiere generaciones y carreras (mismos nombres/claves que new-admissions.seed).
 * Los correos se generan como nombre.apellido.{controlNumber}@example.com porque el mock
 * repite emails y el modelo exige email único.
 */
const GENERATION_NAMES: Record<string, string> = {
  '1': 'Generación 2020-2024',
  '2': 'Generación 2021-2025',
  '3': 'Generación 2022-2026',
  '4': 'Generación 2019-2023',
  '5': 'Generación 2018-2022',
  '6': 'Generación 2017-2021',
  '7': 'Generación 2023-2027',
};

const CAREER_SHORT_NAMES: Record<string, string> = {
  '1': 'ISC',
  '2': 'LAE',
  '3': 'II',
};

function seedEmail(
  firstName: string,
  paternalLastName: string,
  controlNumber: string
): string {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  return `${norm(firstName)}.${norm(
    paternalLastName
  )}.${controlNumber}@example.com`;
}

const SEED_STUDENTS: Array<{
  careerKey: keyof typeof CAREER_SHORT_NAMES;
  generationKey: keyof typeof GENERATION_NAMES;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  birthDate: Date;
  sex: Sex;
  isEgressed: boolean;
  status: StudentStatus;
  processStatus: ProcessStatus;
  hasIdCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    careerKey: '1',
    generationKey: '1',
    controlNumber: '20200001',
    firstName: 'Juan',
    paternalLastName: 'Pérez',
    maternalLastName: 'García',
    phoneNumber: '+52 1234567890',
    birthDate: new Date('2000-05-15'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '2',
    controlNumber: '20210002',
    firstName: 'María',
    paternalLastName: 'López',
    maternalLastName: 'Martínez',
    phoneNumber: '+52 9876543210',
    birthDate: new Date('2001-08-22'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-02-20T14:30:00Z'),
    updatedAt: new Date('2024-02-20T14:30:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200003',
    firstName: 'Carlos',
    paternalLastName: 'Rodríguez',
    maternalLastName: 'Sánchez',
    phoneNumber: '+52 5551234567',
    birthDate: new Date('2000-12-10'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-01-10T09:15:00Z'),
    updatedAt: new Date('2024-01-10T09:15:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '2',
    controlNumber: '20210012',
    firstName: 'Laura',
    paternalLastName: 'Hernández',
    maternalLastName: 'Torres',
    phoneNumber: '+52 4445556666',
    birthDate: new Date('2001-03-18'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-03-18T11:00:00Z'),
    updatedAt: new Date('2024-03-18T11:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200013',
    firstName: 'Roberto',
    paternalLastName: 'Mendoza',
    maternalLastName: 'Vargas',
    phoneNumber: '+52 7778889999',
    birthDate: new Date('2000-07-25'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-02-25T16:30:00Z'),
    updatedAt: new Date('2024-02-25T16:30:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '3',
    controlNumber: '20220014',
    firstName: 'Patricia',
    paternalLastName: 'Díaz',
    maternalLastName: 'Morales',
    phoneNumber: '+52 3334445555',
    birthDate: new Date('2002-01-30'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'IN_PROCESS',
    hasIdCard: false,
    createdAt: new Date('2024-04-30T13:45:00Z'),
    updatedAt: new Date('2024-04-30T13:45:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '1',
    controlNumber: '20200004',
    firstName: 'Ana',
    paternalLastName: 'González',
    maternalLastName: 'Hernández',
    phoneNumber: '+52 4445556666',
    birthDate: new Date('2000-07-18'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'SCHEDULED',
    hasIdCard: false,
    createdAt: new Date('2024-01-18T11:45:00Z'),
    updatedAt: new Date('2024-01-18T11:45:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '2',
    controlNumber: '20210005',
    firstName: 'Luis',
    paternalLastName: 'Torres',
    maternalLastName: 'Ramírez',
    phoneNumber: '+52 3334445555',
    birthDate: new Date('2001-03-25'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'SCHEDULED',
    hasIdCard: false,
    createdAt: new Date('2024-02-25T16:20:00Z'),
    updatedAt: new Date('2024-02-25T16:20:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '2',
    controlNumber: '20210015',
    firstName: 'Gabriela',
    paternalLastName: 'Reyes',
    maternalLastName: 'Castillo',
    phoneNumber: '+52 5556667777',
    birthDate: new Date('2001-09-12'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'SCHEDULED',
    hasIdCard: false,
    createdAt: new Date('2024-03-12T14:00:00Z'),
    updatedAt: new Date('2024-03-12T14:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200016',
    firstName: 'Miguel',
    paternalLastName: 'Ortiz',
    maternalLastName: 'Silva',
    phoneNumber: '+52 4443332222',
    birthDate: new Date('2000-11-08'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'SCHEDULED',
    hasIdCard: false,
    createdAt: new Date('2024-04-08T10:30:00Z'),
    updatedAt: new Date('2024-04-08T10:30:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '1',
    controlNumber: '20200006',
    firstName: 'Sofía',
    paternalLastName: 'Díaz',
    maternalLastName: 'Morales',
    phoneNumber: '+52 7778889999',
    birthDate: new Date('2000-09-30'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'GRADUATED',
    hasIdCard: true,
    createdAt: new Date('2024-01-30T13:00:00Z'),
    updatedAt: new Date('2024-01-30T13:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200007',
    firstName: 'Roberto',
    paternalLastName: 'Fernández',
    maternalLastName: 'Vargas',
    phoneNumber: '+52 6667778888',
    birthDate: new Date('2000-11-15'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'GRADUATED',
    hasIdCard: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '2',
    controlNumber: '20210017',
    firstName: 'Carmen',
    paternalLastName: 'Luna',
    maternalLastName: 'Paredes',
    phoneNumber: '+52 5554443333',
    birthDate: new Date('2001-05-20'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'GRADUATED',
    hasIdCard: true,
    createdAt: new Date('2024-02-20T09:00:00Z'),
    updatedAt: new Date('2024-02-20T09:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200018',
    firstName: 'Javier',
    paternalLastName: 'Ríos',
    maternalLastName: 'Mendoza',
    phoneNumber: '+52 7776665555',
    birthDate: new Date('2000-08-05'),
    sex: 'MASCULINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'GRADUATED',
    hasIdCard: true,
    createdAt: new Date('2024-01-05T14:20:00Z'),
    updatedAt: new Date('2024-01-05T14:20:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '3',
    controlNumber: '20220019',
    firstName: 'Elena',
    paternalLastName: 'Castro',
    maternalLastName: 'Serrano',
    phoneNumber: '+52 3332221111',
    birthDate: new Date('2002-02-14'),
    sex: 'FEMENINO',
    isEgressed: true,
    status: 'ACTIVO',
    processStatus: 'GRADUATED',
    hasIdCard: true,
    createdAt: new Date('2024-03-14T11:30:00Z'),
    updatedAt: new Date('2024-03-14T11:30:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '3',
    controlNumber: '20220008',
    firstName: 'Gabriela',
    paternalLastName: 'Reyes',
    maternalLastName: 'Castillo',
    phoneNumber: '+52 5556667777',
    birthDate: new Date('2002-04-12'),
    sex: 'FEMENINO',
    isEgressed: false,
    status: 'ACTIVO',
    processStatus: 'NOT_STARTED',
    hasIdCard: false,
    createdAt: new Date('2024-03-12T12:00:00Z'),
    updatedAt: new Date('2024-03-12T12:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '3',
    controlNumber: '20220009',
    firstName: 'Miguel',
    paternalLastName: 'Ortiz',
    maternalLastName: 'Silva',
    phoneNumber: '+52 4443332222',
    birthDate: new Date('2002-06-08'),
    sex: 'MASCULINO',
    isEgressed: false,
    status: 'ACTIVO',
    processStatus: 'NOT_STARTED',
    hasIdCard: false,
    createdAt: new Date('2024-03-08T15:45:00Z'),
    updatedAt: new Date('2024-03-08T15:45:00Z'),
  },
  {
    careerKey: '1',
    generationKey: '2',
    controlNumber: '20210010',
    firstName: 'Patricia',
    paternalLastName: 'Mendoza',
    maternalLastName: 'Cruz',
    phoneNumber: '+52 3332221111',
    birthDate: new Date('2001-01-20'),
    sex: 'FEMENINO',
    isEgressed: false,
    status: 'PAUSADO',
    processStatus: 'NOT_STARTED',
    hasIdCard: false,
    createdAt: new Date('2024-02-20T10:00:00Z'),
    updatedAt: new Date('2024-02-20T10:00:00Z'),
  },
  {
    careerKey: '2',
    generationKey: '1',
    controlNumber: '20200011',
    firstName: 'Javier',
    paternalLastName: 'Ríos',
    maternalLastName: 'Paredes',
    phoneNumber: '+52 7776665555',
    birthDate: new Date('2000-08-05'),
    sex: 'MASCULINO',
    isEgressed: false,
    status: 'CANCELADO',
    processStatus: 'NOT_STARTED',
    hasIdCard: false,
    createdAt: new Date('2024-01-05T14:20:00Z'),
    updatedAt: new Date('2024-01-05T14:20:00Z'),
  },
];

export async function seedStudents(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  const generations = await GenerationModel.find({}).lean();
  const careers = await CareerModel.find({}).lean();

  const generationByName = new Map(
    generations.map((g) => [g.name ?? '', g._id])
  );
  const careerByShortName = new Map(careers.map((c) => [c.shortName, c._id]));

  for (const row of SEED_STUDENTS) {
    const generationName = GENERATION_NAMES[row.generationKey];
    const careerShortName = CAREER_SHORT_NAMES[row.careerKey];
    const generationId = generationByName.get(generationName);
    const careerId = careerByShortName.get(careerShortName);

    if (!generationId) {
      console.log(
        `Skipping student ${row.controlNumber}: generation "${generationName}" not found. Run generations seed first.`
      );
      continue;
    }
    if (!careerId) {
      console.log(
        `Skipping student ${row.controlNumber}: career "${careerShortName}" not found. Run careers seed first.`
      );
      continue;
    }

    const email = seedEmail(
      row.firstName,
      row.paternalLastName,
      row.controlNumber
    );

    const existing = await StudentModel.findOne({
      controlNumber: row.controlNumber,
    });

    if (!existing) {
      await StudentModel.create({
        careerId,
        generationId,
        controlNumber: row.controlNumber,
        firstName: row.firstName,
        paternalLastName: row.paternalLastName,
        maternalLastName: row.maternalLastName,
        phoneNumber: row.phoneNumber,
        email,
        birthDate: row.birthDate,
        sex: row.sex,
        isEgressed: row.isEgressed,
        status: row.status,
        processStatus: row.processStatus,
        hasIdCard: row.hasIdCard,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
      console.log(
        `Created student: ${row.controlNumber} (${careerShortName} / ${generationName})`
      );
    } else {
      console.log(`Student already exists: ${row.controlNumber}`);
    }
  }

  await mongoose.disconnect();
}
