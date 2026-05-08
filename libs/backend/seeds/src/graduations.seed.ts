import mongoose from 'mongoose';
import { GraduationOptionModel } from '@backend/graduation-options';
import { GraduationModel, StudentModel } from '@backend/students';

/**
 * Titulaciones alineadas con `apps/sistema-titulacion-cliente/src/mocks/data/graduations.ts`.
 * Requiere `seedGraduationOptions`, `seedStudents` (mismos números de control que el mock).
 *
 * Los `graduationOptionId` del mock ('1', '2') corresponden a Tesis y Residencia Profesional
 * en `graduation-options.seed`.
 */
const MOCK_OPTION_ID_TO_NAME: Record<string, string> = {
  '1': 'Tesis',
  '2': 'Residencia Profesional',
};

const SEED_GRADUATIONS: Array<{
  controlNumber: string;
  graduationOptionMockId: keyof typeof MOCK_OPTION_ID_TO_NAME;
  scheduledDate: Date | null;
  graduationDate: Date | null;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  idCardNumber: string | null;
  idCardIssueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    controlNumber: '20200004',
    graduationOptionMockId: '1',
    scheduledDate: new Date('2024-12-15T14:30:00Z'),
    graduationDate: null,
    president: 'Dr. Carlos Ramírez García',
    secretary: 'Mtra. Ana Martínez López',
    vocal: 'Ing. Luis Sánchez Pérez',
    substituteVocal: 'Dra. María González Hernández',
    notes: 'Programado para titulación en diciembre 2024.',
    idCardNumber: null,
    idCardIssueDate: null,
    createdAt: new Date('2024-01-18T11:45:00Z'),
    updatedAt: new Date('2024-01-18T11:45:00Z'),
  },
  {
    controlNumber: '20210005',
    graduationOptionMockId: '2',
    scheduledDate: new Date('2025-01-20T16:00:00Z'),
    graduationDate: null,
    president: 'Dra. Laura Fernández Torres',
    secretary: 'Dr. Roberto Morales Díaz',
    vocal: 'Mtra. Patricia Rivera Silva',
    substituteVocal: 'Ing. Juan Carlos Méndez',
    notes: 'Programado para titulación en enero 2025.',
    idCardNumber: null,
    idCardIssueDate: null,
    createdAt: new Date('2024-02-25T16:20:00Z'),
    updatedAt: new Date('2024-02-25T16:20:00Z'),
  },
  {
    controlNumber: '20210015',
    graduationOptionMockId: '1',
    scheduledDate: new Date('2024-11-30T10:00:00Z'),
    graduationDate: null,
    president: 'Dr. Miguel Ángel Torres',
    secretary: 'Mtra. Carmen Patricia Reyes',
    vocal: 'Ing. Roberto Díaz Morales',
    substituteVocal: 'Dra. Sofía Hernández López',
    notes: 'Programado para titulación en noviembre 2024.',
    idCardNumber: null,
    idCardIssueDate: null,
    createdAt: new Date('2024-03-12T14:00:00Z'),
    updatedAt: new Date('2024-03-12T14:00:00Z'),
  },
  {
    controlNumber: '20200016',
    graduationOptionMockId: '2',
    scheduledDate: new Date('2024-12-10T15:30:00Z'),
    graduationDate: null,
    president: 'Dra. María Luisa González',
    secretary: 'Dr. José Antonio Martínez',
    vocal: 'Mtra. Patricia Silva Reyes',
    substituteVocal: 'Ing. Carlos Fernando López',
    notes: 'Programado para titulación en diciembre 2024.',
    idCardNumber: null,
    idCardIssueDate: null,
    createdAt: new Date('2024-04-08T10:30:00Z'),
    updatedAt: new Date('2024-04-08T10:30:00Z'),
  },
  {
    controlNumber: '20200006',
    graduationOptionMockId: '1',
    scheduledDate: null,
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
    controlNumber: '20200007',
    graduationOptionMockId: '2',
    scheduledDate: null,
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
    controlNumber: '20210017',
    graduationOptionMockId: '1',
    scheduledDate: null,
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
    controlNumber: '20200018',
    graduationOptionMockId: '2',
    scheduledDate: null,
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
    controlNumber: '20220019',
    graduationOptionMockId: '1',
    scheduledDate: null,
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
];

export async function seedGraduations(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  const optionByName = new Map<string, mongoose.Types.ObjectId>();
  const options = await GraduationOptionModel.find({}).lean();
  for (const o of options) {
    if (o.name) {
      optionByName.set(o.name, o._id as mongoose.Types.ObjectId);
    }
  }

  for (const row of SEED_GRADUATIONS) {
    const student = await StudentModel.findOne({
      controlNumber: row.controlNumber,
    });

    if (!student) {
      console.log(
        `Skipping graduation for ${row.controlNumber}: student not found. Run students seed first.`
      );
      continue;
    }

    const optName = MOCK_OPTION_ID_TO_NAME[row.graduationOptionMockId];
    const graduationOptionId = optionByName.get(optName);
    if (!graduationOptionId) {
      console.log(
        `Skipping graduation for ${row.controlNumber}: graduation option "${optName}" not found. Run graduation-options seed first.`
      );
      continue;
    }

    const existing = await GraduationModel.findOne({ studentId: student._id });
    if (existing) {
      console.log(
        `Graduation already exists for student: ${row.controlNumber}`
      );
      continue;
    }

    await GraduationModel.create({
      studentId: student._id,
      graduationOptionId,
      graduationDate: row.graduationDate,
      scheduledDate: row.scheduledDate,
      president: row.president,
      secretary: row.secretary,
      vocal: row.vocal,
      substituteVocal: row.substituteVocal,
      notes: row.notes,
      idCardNumber: row.idCardNumber,
      idCardIssueDate: row.idCardIssueDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    console.log(`Created graduation for student: ${row.controlNumber}`);
  }

  await mongoose.disconnect();
}
