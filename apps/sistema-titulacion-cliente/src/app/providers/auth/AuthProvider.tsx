import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@features/auth';
import { logger } from '@shared/lib';

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
      } catch {
        logger.info('No hay sesión activa');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [checkAuth]);

  if (!isInitialized || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-document-bg)">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full border-(--color-gray-1) border-t-(--color-primary-color) animate-spin"></div>
          <p className="m-0 text-base text-(--color-base-secondary-typo)">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
