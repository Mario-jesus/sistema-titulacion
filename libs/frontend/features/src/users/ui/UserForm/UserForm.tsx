import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import { getPasswordValidationError } from '@shared/lib/validation';
import type { CreateUserRequest, UpdateUserRequest } from '../../model/types';
import type { User } from '@entities/user';
import { UserRole } from '@entities/user';

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: User | null;
}

export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: UserFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setUsername(initialData.username || '');
      setEmail(initialData.email || '');
      setRole(initialData.role || UserRole.STAFF);
      setIsActive(initialData.isActive);
      // No establecer password en modo edición
      setPassword('');
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setUsername('');
      setEmail('');
      setPassword('');
      setRole(UserRole.STAFF);
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Password solo requerido en modo creación
    if (mode === 'create') {
      const passwordError = getPasswordValidationError(password.trim());
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await onSubmit({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          isActive,
        });
      } else {
        // En modo edición, no incluir password
        await onSubmit({
          username: username.trim(),
          email: email.trim(),
          role,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      // El error se maneja en el componente padre
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre de Usuario *"
          placeholder="Ej: juan.perez"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) {
              setErrors({ ...errors, username: undefined });
            }
          }}
          error={errors.username}
          fullWidth
          disabled={isSubmitting}
          required
        />

        <Input
          label="Correo Electrónico *"
          placeholder="Ej: juan.perez@example.com"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors({ ...errors, email: undefined });
            }
          }}
          error={errors.email}
          fullWidth
          disabled={isSubmitting}
          required
        />

        {mode === 'create' && (
          <Input
            label="Contraseña *"
            placeholder="Mín. 8 caracteres: números, mayúsculas, minúsculas y símbolos"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
            fullWidth
            disabled={isSubmitting}
            required
          />
        )}

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Rol *
          </label>
          <select
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole);
              if (errors.role) {
                setErrors({ ...errors, role: undefined });
              }
            }}
            disabled={isSubmitting}
            required
          >
            <option value={UserRole.STAFF}>Personal (STAFF)</option>
            <option value={UserRole.ADMIN}>Administrador (ADMIN)</option>
          </select>
          {errors.role && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.role}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-(--color-input-border) text-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 cursor-pointer"
          />
          <label
            htmlFor="isActive"
            className="text-sm cursor-pointer"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Usuario activo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
