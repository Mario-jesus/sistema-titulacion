import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type {
  CreateGraduationOptionRequest,
  UpdateGraduationOptionRequest,
} from '../../model/types';
import type { GraduationOption } from '@entities/graduation-option';

export interface GraduationOptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateGraduationOptionRequest | UpdateGraduationOptionRequest
  ) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: GraduationOption | null;
}

export function GraduationOptionForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: GraduationOptionFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setName('');
      setDescription('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
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
          name: name.trim(),
          description: description.trim() || null,
          isActive,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          description: description.trim() || null,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error al guardar opción de titulación:', error);
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
      title={
        mode === 'create'
          ? 'Crear Opción de Titulación'
          : 'Editar Opción de Titulación'
      }
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre *"
          placeholder="Ej: Tesis"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) {
              setErrors({ ...errors, name: undefined });
            }
          }}
          error={errors.name}
          fullWidth
          disabled={isSubmitting}
          required
        />

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Descripción
          </label>
          <textarea
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none placeholder:text-(--color-base-secondary-typo) focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            placeholder="Descripción opcional de la opción de titulación"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            disabled={isSubmitting}
            rows={4}
          />
          {errors.description && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.description}
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
            Opción activa
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
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
