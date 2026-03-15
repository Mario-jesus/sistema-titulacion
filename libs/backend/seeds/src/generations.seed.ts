import mongoose from 'mongoose';
import { GenerationModel } from '@backend/generations';

/**
 * Generaciones alineadas con mocks del cliente (generations.ts)
 */
const SEED_GENERATIONS = [
  {
    name: 'Generación 2020-2024',
    startYear: new Date('2020-08-01T00:00:00Z'),
    endYear: new Date('2024-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2020',
    isActive: true,
  },
  {
    name: 'Generación 2021-2025',
    startYear: new Date('2021-08-01T00:00:00Z'),
    endYear: new Date('2025-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2021',
    isActive: true,
  },
  {
    name: 'Generación 2022-2026',
    startYear: new Date('2022-08-01T00:00:00Z'),
    endYear: new Date('2026-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2022',
    isActive: true,
  },
  {
    name: 'Generación 2019-2023',
    startYear: new Date('2019-08-01T00:00:00Z'),
    endYear: new Date('2023-07-31T23:59:59Z'),
    description: null,
    isActive: false,
  },
  {
    name: 'Generación 2018-2022',
    startYear: new Date('2018-08-01T00:00:00Z'),
    endYear: new Date('2022-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2018',
    isActive: false,
  },
  {
    name: 'Generación 2017-2021',
    startYear: new Date('2017-08-01T00:00:00Z'),
    endYear: new Date('2021-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2017',
    isActive: false,
  },
  {
    name: 'Generación 2023-2027',
    startYear: new Date('2023-08-01T00:00:00Z'),
    endYear: new Date('2027-07-31T23:59:59Z'),
    description: 'Generación de estudiantes que ingresaron en 2023',
    isActive: true,
  },
];

export async function seedGenerations(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  for (const g of SEED_GENERATIONS) {
    const existing = await GenerationModel.findOne({
      startYear: g.startYear,
      endYear: g.endYear,
    });

    if (!existing) {
      await GenerationModel.create(g);
      console.log(`Created generation: ${g.name}`);
    } else {
      console.log(`Generation already exists: ${g.name}`);
    }
  }

  await mongoose.disconnect();
}
