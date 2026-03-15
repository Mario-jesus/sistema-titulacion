/**
 * Seed de registros de nuevo ingreso.
 * Requiere generaciones y carreras (ejecutar seed:all o seeds de generations y careers antes).
 * Ejecutar desde la raíz: npm run seed:new-admissions
 */
import '../src/load-env';
import { seedNewAdmissions } from '@backend/seeds';

const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sistema-titulacion';

seedNewAdmissions(mongoUri)
  .then(() => {
    console.log('Seed de nuevo ingreso completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed falló:', err);
    process.exit(1);
  });
