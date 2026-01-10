import { lazy } from 'react';

/**
 * Módulo centralizado para lazy loading de páginas
 *
 * Este módulo se encarga de crear todos los lazy loadings de las páginas
 * para mantener el AppRouter.tsx limpio y escalable.
 *
 * Para agregar una nueva página:
 * 1. Importa la página desde @pages
 * 2. Crea el lazy loading usando lazy(() => import('@pages/NombrePage'))
 * 3. Exporta el componente lazy
 */

// Páginas públicas
export const LoginPage = lazy(() =>
  import('@pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

// Páginas protegidas
export const ComingSoonPage = lazy(() =>
  import('@pages/ComingSoonPage').then((module) => ({
    default: module.ComingSoonPage,
  }))
);

export const GenerationsPage = lazy(() =>
  import('@pages/GenerationsPage').then((module) => ({
    default: module.GenerationsPage,
  }))
);

export const GraduationOptionsPage = lazy(() =>
  import('@pages/GraduationOptionsPage').then((module) => ({
    default: module.GraduationOptionsPage,
  }))
);
