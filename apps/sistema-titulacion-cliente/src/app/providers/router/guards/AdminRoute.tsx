import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { UserRole } from '@entities/user';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // Primero verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Luego verificar que sea administrador
  if (user?.role !== UserRole.ADMIN) {
    // Redirigir al dashboard si no es administrador
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
