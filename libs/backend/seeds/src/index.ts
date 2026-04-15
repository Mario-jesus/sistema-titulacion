import { seedUsers } from './users.seed';
import { seedModalities } from './modalities.seed';
import { seedGenerations } from './generations.seed';
import { seedCareers } from './careers.seed';
import { seedGraduationOptions } from './graduation-options.seed';
import { seedNewAdmissions } from './new-admissions.seed';
import { seedStudents } from './students.seed';
import { seedCapturedFields } from './captured-fields.seed';

export {
  seedUsers,
  seedModalities,
  seedGenerations,
  seedCareers,
  seedGraduationOptions,
  seedNewAdmissions,
  seedStudents,
  seedCapturedFields,
};

/**
 * Ejecuta todos los seeds en orden.
 * Modalidades y generaciones primero (sin dependencias).
 * Carreras después (depende de modalidades).
 * Opciones de titulación (sin dependencias cruzadas).
 * Nuevo ingreso (depende de generaciones y carreras).
 * Estudiantes (depende de generaciones y carreras).
 * Campos capturados (depende de estudiantes).
 */
export async function runAllSeeds(mongoUri: string): Promise<void> {
  await seedUsers(mongoUri);
  await seedModalities(mongoUri);
  await seedGenerations(mongoUri);
  await seedCareers(mongoUri);
  await seedGraduationOptions(mongoUri);
  await seedNewAdmissions(mongoUri);
  await seedStudents(mongoUri);
  await seedCapturedFields(mongoUri);
}
