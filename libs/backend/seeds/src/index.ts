import { seedUsers } from './users.seed';
import { seedModalities } from './modalities.seed';
import { seedGenerations } from './generations.seed';
import { seedCareers } from './careers.seed';

export { seedUsers, seedModalities, seedGenerations, seedCareers };

/**
 * Ejecuta todos los seeds en orden.
 * Modalidades y generaciones primero (sin dependencias).
 * Carreras después (depende de modalidades).
 */
export async function runAllSeeds(mongoUri: string): Promise<void> {
  await seedUsers(mongoUri);
  await seedModalities(mongoUri);
  await seedGenerations(mongoUri);
  await seedCareers(mongoUri);
}
