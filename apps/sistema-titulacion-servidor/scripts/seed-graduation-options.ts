/**
 * Seed de opciones de titulación.
 * Ejecutar desde la raíz: npm run seed:graduation-options
 */
import '../src/load-env';
import { seedGraduationOptions } from '@backend/seeds';

const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sistema-titulacion';

seedGraduationOptions(mongoUri)
  .then(() => {
    console.log('Seed de opciones de titulación completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed falló:', err);
    process.exit(1);
  });
