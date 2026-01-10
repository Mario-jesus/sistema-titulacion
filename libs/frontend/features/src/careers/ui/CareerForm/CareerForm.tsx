import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type {
  CreateCareerRequest,
  UpdateCareerRequest,
} from '../../model/types';
import type { Career } from '@entities/career';
import type { Modality } from '@entities/modality';
import { loadActiveModalities } from '../../api/modalitiesHelper';

export interface CareerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCareerRequest | UpdateCareerRequest) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Career | null;
}

export function CareerForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: CareerFormProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [modalityId, setModalityId] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoadingModalities, setIsLoadingModalities] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    shortName?: string;
    modalityId?: string;
    description?: string;
  }>({});

  // Cargar modalidades activas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsLoadingModalities(true);
      loadActiveModalities()
        .then((data) => {
          setModalities(data);
        })
        .catch((error) => {
          console.error('Error al cargar modalidades:', error);
          setModalities([]);
        })
        .finally(() => {
          setIsLoadingModalities(false);
        });
    }
  }, [isOpen]);

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setShortName(initialData.shortName || '');
      setModalityId(initialData.modalityId || '');
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setName('');
      setShortName('');
      setModalityId('');
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

    if (!shortName.trim()) {
      newErrors.shortName = 'El nombre corto es requerido';
    }

    if (!modalityId) {
      newErrors.modalityId = 'La modalidad es requerida';
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
          shortName: shortName.trim(),
          modalityId,
          description: description.trim() || null,
          isActive,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          shortName: shortName.trim(),
          modalityId,
          description: description.trim() || null,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error al guardar carrera:', error);
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
      title={mode === 'create' ? 'Crear Carrera' : 'Editar Carrera'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre *"
          placeholder="Ej: Ingeniería en Sistemas Computacionales"
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

        <Input
          label="Nombre Corto *"
          placeholder="Ej: ISC"
          value={shortName}
          onChange={(e) => {
            setShortName(e.target.value);
            if (errors.shortName) {
              setErrors({ ...errors, shortName: undefined });
            }
          }}
          error={errors.shortName}
          fullWidth
          disabled={isSubmitting}
          required
        />

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Modalidad *
          </label>
          <select
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
            value={modalityId}
            onChange={(e) => {
              setModalityId(e.target.value);
              if (errors.modalityId) {
                setErrors({ ...errors, modalityId: undefined });
              }
            }}
            disabled={isSubmitting || isLoadingModalities}
            required
          >
            <option value="">
              {isLoadingModalities
                ? 'Cargando modalidades...'
                : 'Selecciona una modalidad'}
            </option>
            {modalities.map((modality) => (
              <option key={modality.id} value={modality.id}>
                {modality.name}
              </option>
            ))}
          </select>
          {errors.modalityId && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.modalityId}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Descripción
          </label>
          <textarea
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none placeholder:text-(--color-base-secondary-typo) focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            placeholder="Descripción opcional de la carrera"
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
            Carrera activa
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
