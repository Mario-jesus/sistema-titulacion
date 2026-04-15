/**
 * Ejecuta todos los seeds (usuarios, modalidades, generaciones, carreras,
 * opciones de titulación, nuevo ingreso, estudiantes, campos capturados, titulaciones).
 * Ejecutar desde la raíz: npm run seed:all
 *
 * Requiere que MongoDB esté corriendo. Las modalidades y generaciones
 * deben existir antes de las carreras (las carreras referencian modalidades).
 */
import '../src/load-env';
import { runAllSeeds } from '@backend/seeds';

const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sistema-titulacion';

runAllSeeds(mongoUri)
  .then(() => {
    console.log('Todos los seeds completados');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeds fallaron:', err);
    process.exit(1);
  });
