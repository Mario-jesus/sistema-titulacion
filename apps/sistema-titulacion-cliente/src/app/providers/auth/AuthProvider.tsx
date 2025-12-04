import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@features/auth';
import { logger } from '@shared/lib';
import './AuthProvider.scss';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isCheckingAuth } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
        logger.info('Sesión restaurada exitosamente');
      } catch (error) {
        logger.info('No hay sesión activa');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [checkAuth]);

  if (!isInitialized || isCheckingAuth) {
    return (
      <div className="auth-provider-loading">
        <div className="auth-provider-spinner">
          <div className="spinner"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
