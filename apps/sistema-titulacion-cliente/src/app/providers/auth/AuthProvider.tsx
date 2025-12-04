import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@features/auth';
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
        console.log('Sesión restaurada exitosamente');
      } catch (error) {
        console.log('No hay sesión activa');
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
