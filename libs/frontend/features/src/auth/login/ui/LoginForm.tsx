import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@shared/ui';
import { useAuth } from '../../lib/useAuth';
import './LoginForm.scss';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

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

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error en login:', err);
    }
  };

  return (
    <div className="login-form-container">
      <Card className="login-form-card" padding="large">
        <h1 className="login-form-title">Acceso</h1>

        <form onSubmit={handleSubmit} className="login-form">
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

          {error && (
            <div className="login-form-error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Iniciar sesión
          </Button>

          <a href="/forgot-password" className="login-form-link">
            ¿Olvido su contraseña?
          </a>
        </form>
      </Card>
    </div>
  );
}
