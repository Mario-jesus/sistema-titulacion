import { HttpHandler } from 'msw';
import { authHandlers } from './auth.handlers';
import { usersHandlers } from './users.handlers';
import { graduationOptionsHandlers } from './graduation-options.handlers';
import { generationsHandlers } from './generations.handlers';
import { modalitiesHandlers } from './modalities.handlers';
import { careersHandlers } from './careers.handlers';
import { quotasHandlers } from './quotas.handlers';
import { studentsHandlers } from './students.handlers';
import { capturedFieldsHandlers } from './captured-fields.handlers';
import { graduationsHandlers } from './graduations.handlers';
import { ingressEgressHandlers } from './ingress-egress.handlers';
import { dashboardHandlers } from './dashboard.handlers';

/**
 * Combina todos los handlers de diferentes módulos
 *
 * Para agregar nuevos handlers:
 * 1. Crea un nuevo archivo en esta carpeta (ej: users.handlers.ts)
 * 2. Exporta un array de handlers (ej: export const usersHandlers = [...])
 * 3. Importa y agrega aquí: import { usersHandlers } from './users.handlers';
 * 4. Agrega al array handlers: ...usersHandlers
 */
export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...usersHandlers,
  ...graduationOptionsHandlers,
  ...generationsHandlers,
  ...modalitiesHandlers,
  ...careersHandlers,
  ...quotasHandlers,
  ...studentsHandlers,
  ...capturedFieldsHandlers,
  ...graduationsHandlers,
  ...ingressEgressHandlers,
  ...dashboardHandlers,
  // Agrega más handlers aquí cuando los necesites:
  // ...modulesHandlers,
  // etc.
];
