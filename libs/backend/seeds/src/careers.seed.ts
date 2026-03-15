import mongoose from 'mongoose';
import { ModalityModel } from '@backend/modalities';
import { CareerModel } from '@backend/careers';

/**
 * Carreras alineadas con mocks del cliente (careers.ts).
 * Modalidades: Presencial, En Línea, Mixta, Sabatina
 */
const SEED_CAREERS = [
  {
    name: 'Ingeniería en Sistemas Computacionales',
    shortName: 'ISC',
    modalityName: 'Presencial',
    description:
      'Carrera enfocada en el desarrollo de software y sistemas computacionales',
    isActive: true,
  },
  {
    name: 'Licenciatura en Administración de Empresas',
    shortName: 'LAE',
    modalityName: 'En Línea',
    description: 'Carrera orientada a la administración y gestión de empresas',
    isActive: true,
  },
  {
    name: 'Ingeniería Industrial',
    shortName: 'II',
    modalityName: 'Mixta',
    description: 'Carrera enfocada en la optimización de procesos industriales',
    isActive: true,
  },
  {
    name: 'Ingeniería Electromecánica',
    shortName: 'IEM',
    modalityName: 'Sabatina',
    description: null,
    isActive: false,
  },
];

export async function seedCareers(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const c of SEED_CAREERS) {
    const modality = await ModalityModel.findOne({
      name: {
        $regex: new RegExp(
          `^${c.modalityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
    });

    if (!modality) {
      console.log(
        `Skipping career ${c.name}: modality "${c.modalityName}" not found. Run modalities seed first.`
      );
      continue;
    }

    const existing = await CareerModel.findOne({
      shortName: {
        $regex: new RegExp(
          `^${c.shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
      modalityId: modality._id,
    });

    if (!existing) {
      await CareerModel.create({
        name: c.name,
        shortName: c.shortName,
        modalityId: modality._id,
        description: c.description ?? null,
        isActive: c.isActive,
      });
      console.log(`Created career: ${c.name} (${c.shortName})`);
    } else {
      console.log(`Career already exists: ${c.name} (${c.shortName})`);
    }
  }

  await mongoose.disconnect();
}
