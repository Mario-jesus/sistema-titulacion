import mongoose from 'mongoose';
import { CareerModel } from '@backend/careers';
import { GenerationModel } from '@backend/generations';
import { NewAdmissionModel } from '@backend/new-admissions';

/**
 * Registros de nuevo ingreso alineados con mocks del cliente (new-admissions.ts).
 * Requiere que generaciones y carreras existan (run generations y careers seed antes).
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

const SEED_NEW_ADMISSIONS = [
  {
    generationKey: '1',
    careerKey: '1',
    maleCount: 7,
    femaleCount: 5,
    description: 'Registro de nuevo ingreso de ISC - Generación 2020-2024',
    isActive: true,
  },
  {
    generationKey: '1',
    careerKey: '2',
    maleCount: 4,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de LAE - Generación 2020-2024',
    isActive: true,
  },
  {
    generationKey: '2',
    careerKey: '1',
    maleCount: 6,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de ISC - Generación 2021-2025',
    isActive: true,
  },
  {
    generationKey: '2',
    careerKey: '3',
    maleCount: 3,
    femaleCount: 3,
    description: null,
    isActive: false,
  },
  {
    generationKey: '1',
    careerKey: '3',
    maleCount: 4,
    femaleCount: 3,
    description: 'Registro de nuevo ingreso de II - Generación 2020-2024',
    isActive: true,
  },
  {
    generationKey: '2',
    careerKey: '2',
    maleCount: 5,
    femaleCount: 4,
    description: 'Registro de nuevo ingreso de LAE - Generación 2021-2025',
    isActive: true,
  },
  {
    generationKey: '3',
    careerKey: '1',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2022-2026',
    isActive: true,
  },
  {
    generationKey: '3',
    careerKey: '2',
    maleCount: 1,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2022-2026',
    isActive: true,
  },
  {
    generationKey: '3',
    careerKey: '3',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2022-2026',
    isActive: true,
  },
  {
    generationKey: '4',
    careerKey: '1',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de ISC - Generación 2019-2023',
    isActive: true,
  },
  {
    generationKey: '4',
    careerKey: '2',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2019-2023',
    isActive: true,
  },
  {
    generationKey: '4',
    careerKey: '3',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de II - Generación 2019-2023',
    isActive: true,
  },
  {
    generationKey: '5',
    careerKey: '1',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2018-2022',
    isActive: true,
  },
  {
    generationKey: '5',
    careerKey: '2',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de LAE - Generación 2018-2022',
    isActive: true,
  },
  {
    generationKey: '5',
    careerKey: '3',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2018-2022',
    isActive: true,
  },
  {
    generationKey: '6',
    careerKey: '1',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de ISC - Generación 2017-2021',
    isActive: true,
  },
  {
    generationKey: '6',
    careerKey: '2',
    maleCount: 0,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2017-2021',
    isActive: true,
  },
  {
    generationKey: '6',
    careerKey: '3',
    maleCount: 1,
    femaleCount: 0,
    description: 'Registro de nuevo ingreso de II - Generación 2017-2021',
    isActive: true,
  },
  {
    generationKey: '7',
    careerKey: '1',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de ISC - Generación 2023-2027',
    isActive: true,
  },
  {
    generationKey: '7',
    careerKey: '2',
    maleCount: 1,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de LAE - Generación 2023-2027',
    isActive: true,
  },
  {
    generationKey: '7',
    careerKey: '3',
    maleCount: 2,
    femaleCount: 1,
    description: 'Registro de nuevo ingreso de II - Generación 2023-2027',
    isActive: true,
  },
];

export async function seedNewAdmissions(mongoUri: string): Promise<void> {
  await mongoose.connect(mongoUri);

  const generations = await GenerationModel.find({}).lean();
  const careers = await CareerModel.find({}).lean();

  const generationByName = new Map(
    generations.map((g) => [g.name ?? '', g._id])
  );
  const careerByShortName = new Map(careers.map((c) => [c.shortName, c._id]));

  for (const row of SEED_NEW_ADMISSIONS) {
    const generationName = GENERATION_NAMES[row.generationKey];
    const careerShortName = CAREER_SHORT_NAMES[row.careerKey];
    const generationId = generationByName.get(generationName);
    const careerId = careerByShortName.get(careerShortName);

    if (!generationId) {
      console.log(
        `Skipping new admission (gen ${row.generationKey}, career ${row.careerKey}): generation "${generationName}" not found. Run generations seed first.`
      );
      continue;
    }
    if (!careerId) {
      console.log(
        `Skipping new admission (gen ${row.generationKey}, career ${row.careerKey}): career "${careerShortName}" not found. Run careers seed first.`
      );
      continue;
    }

    const existing = await NewAdmissionModel.findOne({
      generationId,
      careerId,
    });

    if (!existing) {
      await NewAdmissionModel.create({
        generationId,
        careerId,
        maleCount: row.maleCount,
        femaleCount: row.femaleCount,
        description: row.description ?? null,
        isActive: row.isActive,
      });
      console.log(
        `Created new admission: ${careerShortName} / ${generationName} (${row.maleCount}M ${row.femaleCount}F)`
      );
    } else {
      console.log(
        `New admission already exists: ${careerShortName} / ${generationName}`
      );
    }
  }

  await mongoose.disconnect();
}
