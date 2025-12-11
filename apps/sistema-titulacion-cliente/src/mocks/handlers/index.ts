import { HttpHandler } from 'msw';
import { authHandlers } from './auth.handlers';

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
  // Agrega más handlers aquí cuando los necesites:
  // ...usersHandlers,
  // ...productsHandlers,
  // etc.
];
