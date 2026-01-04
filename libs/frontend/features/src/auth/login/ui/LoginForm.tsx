import { FormEvent, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, ThemeToggle, useToast } from '@shared/ui';
import { useAuth } from '../../lib/useAuth';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error, isCheckingAuth } = useAuth();
  const { showToast } = useToast();
  const lastErrorRef = useRef<string | null>(null);
  const hasAttemptedLoginRef = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Mostrar error en toast solo si viene de un intento de login, no de checkAuth
  useEffect(() => {
    // Ignorar errores de checkAuth (cuando isCheckingAuth es true o cuando no hemos intentado login)
    if (error && error !== lastErrorRef.current && hasAttemptedLoginRef.current && !isCheckingAuth) {
      lastErrorRef.current = error;
      showToast({
        type: 'error',
        message: error,
        title: 'Error de autenticación',
      });
    }
  }, [error, isCheckingAuth, showToast]);

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El correo electrónico no es válido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Marcar que hemos intentado hacer login
    hasAttemptedLoginRef.current = true;
    lastErrorRef.current = null; // Resetear el último error para permitir mostrar nuevos errores

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative"
      style={{
        backgroundColor: 'var(--color-document-bg)',
      }}
    >
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md p-4 sm:p-6 md:p-8" padding="none">
        <h1
          className="m-0 mb-6 sm:mb-8 text-xl sm:text-2xl md:text-3xl font-semibold text-center"
          style={{
            color: 'var(--color-base-primary-typo)',
          }}
        >
          Acceso
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          <Input
            label="Correo electrónico:"
            type="email"
            placeholder="Ingrese el correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors({ ...fieldErrors, email: undefined });
              }
            }}
            error={fieldErrors.email}
            fullWidth
            disabled={isLoading}
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Contraseña:"
            type="password"
            placeholder="Ingrese la contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors({ ...fieldErrors, password: undefined });
              }
            }}
            error={fieldErrors.password}
            fullWidth
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Iniciar sesión
          </Button>

          <a
            href="/forgot-password"
            className="block text-center text-sm no-underline transition-colors duration-200 hover:underline"
            style={{
              color: 'var(--color-base-secondary-typo)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-base-secondary-typo)';
            }}
          >
            ¿Olvido su contraseña?
          </a>
        </form>
      </Card>
    </div>
  );
}
