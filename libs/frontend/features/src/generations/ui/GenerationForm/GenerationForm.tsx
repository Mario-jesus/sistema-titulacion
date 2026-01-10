import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type {
  CreateGenerationRequest,
  UpdateGenerationRequest,
} from '../../model/types';
import type { Generation } from '@entities/generation';

export interface GenerationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGenerationRequest | UpdateGenerationRequest) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Generation | null;
}

export function GenerationForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: GenerationFormProps) {
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    startYear?: string;
    endYear?: string;
    description?: string;
  }>({});

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setName(initialData.name || '');
      // Manejar tanto Date como string ISO
      const startYearDate =
        initialData.startYear instanceof Date
          ? initialData.startYear
          : new Date(initialData.startYear);
      const endYearDate =
        initialData.endYear instanceof Date
          ? initialData.endYear
          : new Date(initialData.endYear);
      setStartYear(startYearDate.getFullYear().toString());
      setEndYear(endYearDate.getFullYear().toString());
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setName('');
      setStartYear('');
      setEndYear('');
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

    if (!startYear) {
      newErrors.startYear = 'El año de inicio es requerido';
    } else {
      const startYearNum = parseInt(startYear, 10);
      if (isNaN(startYearNum) || startYearNum < 1900 || startYearNum > 2100) {
        newErrors.startYear = 'El año de inicio debe ser válido (1900-2100)';
      }
    }

    if (!endYear) {
      newErrors.endYear = 'El año de fin es requerido';
    } else {
      const endYearNum = parseInt(endYear, 10);
      if (isNaN(endYearNum) || endYearNum < 1900 || endYearNum > 2100) {
        newErrors.endYear = 'El año de fin debe ser válido (1900-2100)';
      } else if (startYear && parseInt(startYear, 10) >= endYearNum) {
        newErrors.endYear = 'El año de fin debe ser mayor al año de inicio';
      }
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
      const startYearDate = new Date(parseInt(startYear, 10), 0, 1);
      const endYearDate = new Date(parseInt(endYear, 10), 11, 31);

      if (mode === 'create') {
        await onSubmit({
          name: name.trim(),
          startYear: startYearDate,
          endYear: endYearDate,
          description: description.trim() || null,
          isActive,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          startYear: startYearDate,
          endYear: endYearDate,
          description: description.trim() || null,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error al guardar generación:', error);
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
      title={mode === 'create' ? 'Crear Generación' : 'Editar Generación'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre *"
          placeholder="Ej: Generación 2020-2024"
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Año de Inicio *"
            type="number"
            variant="year"
            placeholder="2020"
            value={startYear}
            onChange={(e) => {
              setStartYear(e.target.value);
              if (errors.startYear) {
                setErrors({ ...errors, startYear: undefined });
              }
            }}
            error={errors.startYear}
            fullWidth
            disabled={isSubmitting}
            required
            min="1900"
            max="2100"
          />

          <Input
            label="Año de Fin *"
            type="number"
            variant="year"
            placeholder="2024"
            value={endYear}
            onChange={(e) => {
              setEndYear(e.target.value);
              if (errors.endYear) {
                setErrors({ ...errors, endYear: undefined });
              }
            }}
            error={errors.endYear}
            fullWidth
            disabled={isSubmitting}
            required
            min="1900"
            max="2100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-primary-typo)' }}>
            Descripción
          </label>
          <textarea
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none placeholder:text-(--color-base-secondary-typo) focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            placeholder="Descripción opcional de la generación"
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
            Generación activa
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
