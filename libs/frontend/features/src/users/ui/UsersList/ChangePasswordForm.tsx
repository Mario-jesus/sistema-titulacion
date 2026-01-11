import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type { ChangePasswordRequest } from '../../model/types';

export interface ChangePasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  username: string;
}

export function ChangePasswordForm({
  isOpen,
  onClose,
  onSubmit,
  username,
}: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.trim().length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      // Los administradores no necesitan currentPassword
      await onSubmit({
        newPassword: newPassword.trim(),
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
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
      title={`Cambiar contraseña de ${username}`}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nueva Contraseña *"
          placeholder="Mínimo 6 caracteres"
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) {
              setErrors({ ...errors, newPassword: undefined });
            }
          }}
          error={errors.newPassword}
          fullWidth
          disabled={isSubmitting}
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirmar Nueva Contraseña *"
          placeholder="Repite la nueva contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: undefined });
            }
          }}
          error={errors.confirmPassword}
          fullWidth
          disabled={isSubmitting}
          required
          autoComplete="new-password"
        />

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
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </Modal>
  );
}
