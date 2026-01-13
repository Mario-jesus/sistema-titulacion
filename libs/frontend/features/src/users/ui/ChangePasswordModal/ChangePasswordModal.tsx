import { FormEvent, useState, useEffect } from 'react';
import { Modal, Input, Button, useToast } from '@shared/ui';
import { useUsers } from '../../lib/useUsers';
import { getPasswordValidationError } from '@shared/lib/validation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal para cambiar la contraseña del usuario autenticado
 */
export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { changePasswordMe, isChangingPasswordMe, changePasswordMeError } =
    useUsers();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});
    }
  }, [isOpen]);

  // Mostrar errores en toast
  useEffect(() => {
    if (changePasswordMeError) {
      showToast({
        type: 'error',
        message: changePasswordMeError,
        title: 'Error al cambiar contraseña',
      });
    }
  }, [changePasswordMeError, showToast]);

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }

    const passwordError = getPasswordValidationError(newPassword.trim());
    if (passwordError) {
      errors.newPassword = passwordError;
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (
      currentPassword.trim() &&
      newPassword.trim() &&
      currentPassword.trim() === newPassword.trim()
    ) {
      errors.newPassword =
        'La nueva contraseña debe ser diferente a la contraseña actual';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await changePasswordMe({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
    });

    if (!result.success) {
      // El error ya se muestra en el toast por el useEffect
      return;
    }

    showToast({
      type: 'success',
      message: 'Contraseña actualizada exitosamente',
      title: 'Éxito',
    });

    onClose();
  };

  const handleClose = () => {
    // Resetear errores y valores al cerrar
    setFieldErrors({});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal title="Cambiar Contraseña" isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Contraseña actual:"
          type="password"
          placeholder="Ingrese su contraseña actual"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (fieldErrors.currentPassword) {
              setFieldErrors({
                ...fieldErrors,
                currentPassword: undefined,
              });
            }
          }}
          error={fieldErrors.currentPassword}
          fullWidth
          disabled={isChangingPasswordMe}
          autoComplete="current-password"
        />

        <Input
          label="Nueva contraseña:"
          type="password"
          placeholder="Mín. 8 caracteres: números, mayúsculas, minúsculas y símbolos"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (fieldErrors.newPassword) {
              setFieldErrors({ ...fieldErrors, newPassword: undefined });
            }
            // También limpiar error de confirmación si hay cambio
            if (fieldErrors.confirmPassword && confirmPassword) {
              setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
            }
          }}
          error={fieldErrors.newPassword}
          fullWidth
          disabled={isChangingPasswordMe}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar nueva contraseña:"
          type="password"
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors({
                ...fieldErrors,
                confirmPassword: undefined,
              });
            }
          }}
          error={fieldErrors.confirmPassword}
          fullWidth
          disabled={isChangingPasswordMe}
          autoComplete="new-password"
        />

        <div className="flex gap-3 justify-end mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isChangingPasswordMe}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isChangingPasswordMe}
            disabled={isChangingPasswordMe}
          >
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </Modal>
  );
}
