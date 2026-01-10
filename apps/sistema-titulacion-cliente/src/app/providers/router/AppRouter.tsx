import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { ProtectedRoute, PublicRoute, AdminRoute } from './guards';
import { LayoutWithSidebar } from './layouts';
import { PageLoader } from './components';
import {
  LoginPage,
  ComingSoonPage,
  GenerationsPage,
  GraduationOptionsPage,
  CareersPage,
  ModalitiesPage,
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
          path="/admissions-graduates"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <Suspense fallback={<PageLoader />}>
                  <ComingSoonPage
                    title="Ingreso y Egreso"
                    description="Esta sección está en desarrollo. Aquí podrás gestionar el ingreso y egreso de estudiantes."
                  />
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
                  <ComingSoonPage
                    title="Alumnos"
                    description="Esta sección está en desarrollo. Aquí podrás gestionar la información de los alumnos."
                  />
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
                  <ComingSoonPage
                    title="Alumnos - En Proceso"
                    description="Esta sección está en desarrollo. Aquí podrás ver los alumnos que están en proceso de titulación."
                  />
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
                  <ComingSoonPage
                    title="Alumnos - Titulados"
                    description="Esta sección está en desarrollo. Aquí podrás ver los alumnos que ya están titulados."
                  />
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
                  <ComingSoonPage
                    title="Accesos"
                    description="Esta sección está en desarrollo. Aquí podrás gestionar los accesos y permisos del sistema."
                  />
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
