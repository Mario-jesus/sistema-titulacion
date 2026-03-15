import mongoose from 'mongoose';
import { ModalityModel } from '@backend/modalities';

/**
 * Modalidades alineadas con mocks del cliente (modalities.ts)
 */
const SEED_MODALITIES = [
  {
    name: 'Presencial',
    description: 'Modalidad presencial tradicional',
    isActive: true,
  },
  {
    name: 'En Línea',
    description: 'Modalidad completamente en línea',
    isActive: true,
  },
  {
    name: 'Mixta',
    description: 'Modalidad híbrida, combinando presencial y en línea',
    isActive: true,
  },
  {
    name: 'Sabatina',
    description: null,
    isActive: false,
  },
];

export async function seedModalities(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const m of SEED_MODALITIES) {
    const existing = await ModalityModel.findOne({
      name: {
        $regex: new RegExp(
          `^${m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
    });

    if (!existing) {
      await ModalityModel.create(m);
      console.log(`Created modality: ${m.name}`);
    } else {
      console.log(`Modality already exists: ${m.name}`);
    }
  }

  await mongoose.disconnect();
}
