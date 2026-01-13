import { FormEvent, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { User } from '@entities/user/model';
import { setUser } from '@entities/user/model';
import type { AppDispatch } from '@shared/lib/redux';
import { Modal, Input, Button, useToast, Card } from '@shared/ui';
import { useUsers } from '../../lib/useUsers';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

/**
 * Modal para editar el perfil del usuario autenticado
 */
export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const { updateProfile, isUpdatingProfile, updateProfileError } = useUsers();
  const { showToast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    avatar?: string;
  }>({});

  // Inicializar valores cuando el usuario cambia o el modal se abre
  useEffect(() => {
    if (user && isOpen) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || null);
      setSelectedFile(null);
      setAvatarPreview(user.avatar || null);
      setFieldErrors({});
      // Resetear el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user, isOpen]);

  // Mostrar errores en toast
  useEffect(() => {
    if (updateProfileError) {
      showToast({
        type: 'error',
        message: updateProfileError,
        title: 'Error al actualizar perfil',
      });
    }
  }, [updateProfileError, showToast]);

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!username || username.trim().length === 0) {
      errors.username = 'El nombre de usuario es requerido';
    } else {
      // Validar formato del username: alfanumérico y sin espacios
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(username.trim())) {
        errors.username =
          'El nombre de usuario debe contener solo letras y números, sin espacios';
      }
    }

    if (!email || email.trim().length === 0) {
      errors.email = 'El email es requerido';
    } else {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'El formato del email no es válido';
      }
    }

    // Avatar es opcional, validar tamaño del archivo si hay uno seleccionado
    if (selectedFile) {
      // Validar que sea una imagen
      if (!selectedFile.type.startsWith('image/')) {
        errors.avatar = 'El archivo debe ser una imagen';
      }
      // Validar tamaño máximo (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        errors.avatar = 'El archivo no debe exceder 5MB';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setAvatarPreview(avatar); // Restaurar preview anterior
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setFieldErrors({
        ...fieldErrors,
        avatar: 'El archivo debe ser una imagen',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFieldErrors({
        ...fieldErrors,
        avatar: 'El archivo no debe exceder 5MB',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setFieldErrors({ ...fieldErrors, avatar: undefined });

    // Convertir a base64 para preview y envío
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        // El avatar se establecerá en el submit
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setFieldErrors({ ...fieldErrors, avatar: 'Error al leer el archivo' });
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    setAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFieldErrors({ ...fieldErrors, avatar: undefined });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para actualizar (solo incluir campos que cambiaron)
    const updateData: {
      username?: string;
      email?: string;
      avatar?: string | null;
    } = {};

    if (username.trim() !== (user?.username || '')) {
      updateData.username = username.trim();
    }

    if (email.trim().toLowerCase() !== (user?.email || '').toLowerCase()) {
      updateData.email = email.trim().toLowerCase();
    }

    // Si hay un archivo seleccionado, usar su base64
    // Si no hay archivo pero el preview es diferente del avatar actual, usar el preview
    // Si se eliminó el avatar (preview es null pero había uno antes), enviar null
    let newAvatar: string | null = null;

    if (selectedFile) {
      // Convertir a base64 si aún no está convertido
      newAvatar = avatarPreview;
    } else if (avatarPreview === null && user?.avatar) {
      // Se eliminó el avatar
      newAvatar = null;
    } else if (avatarPreview && avatarPreview !== (user?.avatar || null)) {
      // Preview diferente (puede ser que se haya cambiado de otro origen)
      newAvatar = avatarPreview;
    } else {
      // Sin cambios en avatar
      newAvatar = user?.avatar || null;
    }

    // Solo incluir avatar si cambió
    if (newAvatar !== (user?.avatar || null)) {
      updateData.avatar = newAvatar;
    }

    // Si no hay cambios, no hacer nada
    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    const result = await updateProfile(updateData);

    if (!result.success) {
      // El error ya se muestra en el toast por el useEffect
      return;
    }

    // Actualizar el usuario autenticado en Redux
    dispatch(setUser(result.data));

    showToast({
      type: 'success',
      message: 'Perfil actualizado exitosamente',
      title: 'Éxito',
    });

    onClose();
  };

  const handleClose = () => {
    // Resetear errores y valores al cerrar
    setFieldErrors({});
    setSelectedFile(null);
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || null);
      setAvatarPreview(user.avatar || null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Modal title="Editar Perfil" isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre de usuario:"
          type="text"
          placeholder="Ingrese el nombre de usuario"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) {
              setFieldErrors({ ...fieldErrors, username: undefined });
            }
          }}
          error={fieldErrors.username}
          fullWidth
          disabled={isUpdatingProfile}
          autoComplete="username"
        />

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
          disabled={isUpdatingProfile}
          autoComplete="email"
        />

        {/* Campo de Avatar */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="avatar-file"
            className="text-sm font-medium"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Avatar (opcional):
          </label>
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              id="avatar-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUpdatingProfile}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer file:bg-(--color-primary-color) file:text-white hover:file:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                color: 'var(--color-base-primary-typo)',
              }}
            />
            {fieldErrors.avatar && (
              <span className="text-sm" style={{ color: 'var(--color-red)' }}>
                {fieldErrors.avatar}
              </span>
            )}
            {(avatarPreview || (user?.avatar && !selectedFile)) && (
              <Card variant="flat">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarPreview || user?.avatar || ''}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    {selectedFile && (
                      <>
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--color-base-primary-typo)' }}
                        >
                          {selectedFile.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-base-secondary-typo)' }}
                        >
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </span>
                      </>
                    )}
                    {!selectedFile && user?.avatar && (
                      <span
                        className="text-sm"
                        style={{ color: 'var(--color-base-secondary-typo)' }}
                      >
                        Avatar actual
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleRemoveAvatar}
                    disabled={isUpdatingProfile}
                    type="button"
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isUpdatingProfile}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isUpdatingProfile}
            disabled={isUpdatingProfile}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
