import { seedUsers } from './users.seed';
export { seedUsers };

/**
 * Ejecuta todos los seeds en orden.
 * Añadir aquí los seeds de nuevos módulos.
 */
export async function runAllSeeds(mongoUri: string): Promise<void> {
  await seedUsers(mongoUri);
}
