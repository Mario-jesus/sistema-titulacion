/**
 * Guards de rutas
 *
 * Componentes que protegen las rutas según diferentes criterios:
 * - ProtectedRoute: Requiere autenticación
 * - PublicRoute: Solo accesible si NO estás autenticado
 * - AdminRoute: Requiere autenticación y rol de administrador
 */

export { ProtectedRoute } from './ProtectedRoute';
export { PublicRoute } from './PublicRoute';
export { AdminRoute } from './AdminRoute';
