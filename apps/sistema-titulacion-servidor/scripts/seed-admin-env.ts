/**
 * Crea únicamente el usuario ADMIN desde .env (SEED_ADMIN_*).
 * No crea staff ni otros usuarios de prueba.
 * Ejecutar desde la raíz: npm run seed:admin
 */
import '../src/load-env';
import { seedAdminOnlyFromEnv } from '@backend/seeds';

const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sistema-titulacion';

seedAdminOnlyFromEnv(mongoUri)
  .then(() => {
    console.log('Seed de admin completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed de admin falló:', err);
    process.exit(1);
  });
