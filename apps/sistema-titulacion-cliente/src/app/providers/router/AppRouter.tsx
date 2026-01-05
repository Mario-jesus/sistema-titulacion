import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@pages/LoginPage";
import { ComingSoonPage } from "@pages/ComingSoonPage";
import { useAuth } from "@features/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { LayoutWithSidebar } from "./LayoutWithSidebar";

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Rutas protegidas con Sidebar */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Panel"
                  description="Esta sección está en desarrollo. Aquí podrás ver el resumen general del sistema."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/graduation-options" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Opciones de Titulación"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar las opciones de titulación disponibles para los estudiantes."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/generation" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Generación"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar las generaciones de estudiantes."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admissions-graduates" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Ingreso y Egreso"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar el ingreso y egreso de estudiantes."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Alumnos"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar la información de los alumnos."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/students/in-progress" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Alumnos - En Proceso"
                  description="Esta sección está en desarrollo. Aquí podrás ver los alumnos que están en proceso de titulación."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/students/graduated" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Alumnos - Titulados"
                  description="Esta sección está en desarrollo. Aquí podrás ver los alumnos que ya están titulados."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/careers" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Carreras"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar las carreras disponibles."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Reportes"
                  description="Esta sección está en desarrollo. Aquí podrás generar y visualizar reportes del sistema."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/accesses" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Accesos"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar los accesos y permisos del sistema."
                />
              </LayoutWithSidebar>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/backups" 
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <ComingSoonPage 
                  title="Respaldos"
                  description="Esta sección está en desarrollo. Aquí podrás gestionar los respaldos del sistema."
                />
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
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
