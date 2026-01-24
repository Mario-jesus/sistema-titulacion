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

export const DashboardPage = lazy(() =>
  import('@pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);

export const AccessesPage = lazy(() =>
  import('@pages/AccessesPage').then((module) => ({
    default: module.AccessesPage,
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

export const CareersPage = lazy(() =>
  import('@pages/CareersPage').then((module) => ({
    default: module.CareersPage,
  }))
);

export const ModalitiesPage = lazy(() =>
  import('@pages/ModalitiesPage').then((module) => ({
    default: module.ModalitiesPage,
  }))
);

export const QuotasPage = lazy(() =>
  import('@pages/QuotasPage').then((module) => ({
    default: module.QuotasPage,
  }))
);

export const IngressEgressPage = lazy(() =>
  import('@pages/IngressEgressPage').then((module) => ({
    default: module.IngressEgressPage,
  }))
);

export const StudentsPage = lazy(() =>
  import('@pages/StudentsPage').then((module) => ({
    default: module.StudentsPage,
  }))
);

export const StudentsInProgressPage = lazy(() =>
  import('@pages/StudentsInProgressPage').then((module) => ({
    default: module.StudentsInProgressPage,
  }))
);

export const StudentsScheduledPage = lazy(() =>
  import('@pages/StudentsScheduledPage').then((module) => ({
    default: module.StudentsScheduledPage,
  }))
);

export const StudentsGraduatedPage = lazy(() =>
  import('@pages/StudentsGraduatedPage').then((module) => ({
    default: module.StudentsGraduatedPage,
  }))
);

export const BackupsPage = lazy(() =>
  import('@pages/BackupsPage').then((module) => ({
    default: module.BackupsPage,
  }))
);

export const ReportsPage = lazy(() =>
  import('@pages/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  }))
);
