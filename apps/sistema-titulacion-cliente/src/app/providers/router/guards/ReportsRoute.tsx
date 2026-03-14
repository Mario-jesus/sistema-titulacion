import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { UserRole } from '@entities/user';

interface ReportsRouteProps {
  children: ReactNode;
}

/**
 * Guard for the reports page. Only ADMIN can access reports.
 * STAFF has no permissions for reports and is redirected to dashboard.
 */
export function ReportsRoute({ children }: ReportsRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === UserRole.STAFF) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
