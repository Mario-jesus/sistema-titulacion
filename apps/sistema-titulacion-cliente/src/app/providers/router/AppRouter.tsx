import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { ProtectedRoute, PublicRoute, AdminRoute } from './guards';
import { LayoutWithSidebar } from './layouts';
import { PageLoader } from './components';
import {
  LoginPage,
  ComingSoonPage,
  AccessesPage,
  GenerationsPage,
  GraduationOptionsPage,
  CareersPage,
  ModalitiesPage,
  IngressEgressPage,
  QuotasPage,
  StudentsPage,
  StudentsInProgressPage,
  StudentsScheduledPage,
  StudentsGraduatedPage,
} from './lazyPages';

export function AppRouter() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          }
        />

        {/* Rutas protegidas con Sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <ComingSoonPage
                    title="Panel"
                    description="Esta sección está en desarrollo. Aquí podrás ver el resumen general del sistema."
                  />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/graduation-options"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <GraduationOptionsPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generation"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <GenerationsPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingress-egresses"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <IngressEgressPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingress-egresses/quotas"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <QuotasPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/in-progress"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <StudentsInProgressPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/scheduled"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <StudentsScheduledPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/graduated"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <StudentsGraduatedPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/careers"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <CareersPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/modalities"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <ModalitiesPage />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <ComingSoonPage
                    title="Reportes"
                    description="Esta sección está en desarrollo. Aquí podrás generar y visualizar reportes del sistema."
                  />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/accesses"
          element={
            <AdminRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <AccessesPage />
                </Suspense>
              </LayoutWithSidebar>
            </AdminRoute>
          }
        />

        <Route
          path="/backups"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <ComingSoonPage
                    title="Respaldos"
                    description="Esta sección está en desarrollo. Aquí podrás gestionar los respaldos del sistema."
                  />
                </Suspense>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />

        {/* Rutas de redirección */}
        <Route path="/" element={<RootRedirect />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
