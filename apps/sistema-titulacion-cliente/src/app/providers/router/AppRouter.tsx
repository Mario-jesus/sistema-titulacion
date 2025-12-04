import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { useAuth } from "@features/auth";

function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 className="text-2xl text-green-500 text-center mt-6">
        Dashboard - Autenticado
      </h1>
      {user && (
        <div style={{ marginTop: '1rem' }}>
          <p>Bienvenido: <strong>{user.username}</strong></p>
          <p>Email: {user.email}</p>
          <p>Rol: {user.role}</p>
          <button 
            onClick={handleLogout}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

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
