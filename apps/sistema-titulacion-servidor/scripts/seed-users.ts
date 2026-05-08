/**
 * Seed inicial de usuarios (admin, staff).
 * Ejecutar desde la raíz: npm run seed:users
 */
import '../src/load-env';
import { seedUsers } from '@backend/seeds';

const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sistema-titulacion';

seedUsers(mongoUri)
  .then(() => {
    console.log('Seed completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed falló:', err);
    process.exit(1);
  });
