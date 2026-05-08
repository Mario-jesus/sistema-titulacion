import mongoose from 'mongoose';
import { GraduationOptionModel } from '@backend/graduation-options';

/**
 * Opciones de titulación alineadas con mocks del cliente (graduation-options.ts)
 */
const SEED_GRADUATION_OPTIONS = [
  {
    name: 'Tesis',
    description: 'Proyecto de investigación y tesis',
    isActive: true,
  },
  {
    name: 'Residencia Profesional',
    description:
      'Desarrollo de proyecto durante residencia profesional en empresa',
    isActive: true,
  },
  {
    name: 'Modelo Dual',
    description: 'Proyecto desarrollado en modelo dual',
    isActive: false,
  },
  {
    name: 'Examen de Conocimientos',
    description: null,
    isActive: true,
  },
];

export async function seedGraduationOptions(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const opt of SEED_GRADUATION_OPTIONS) {
    const existing = await GraduationOptionModel.findOne({
      name: {
        $regex: new RegExp(
          `^${opt.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          'i'
        ),
      },
    });

    if (!existing) {
      await GraduationOptionModel.create(opt);
      console.log(`Created graduation option: ${opt.name}`);
    } else {
      console.log(`Graduation option already exists: ${opt.name}`);
    }
  }

  await mongoose.disconnect();
}
