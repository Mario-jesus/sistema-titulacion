import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type { CreateQuotaRequest, UpdateQuotaRequest } from '../../model/types';
import type { Quota } from '@entities/quota';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';

export interface QuotaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateQuotaRequest | UpdateQuotaRequest) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Quota | null;
}

export function QuotaForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: QuotaFormProps) {
  const [generationId, setGenerationId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [newAdmissionQuotas, setNewAdmissionQuotas] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);
  const [errors, setErrors] = useState<{
    generationId?: string;
    careerId?: string;
    newAdmissionQuotas?: string;
    description?: string;
  }>({});

  // Cargar generaciones y carreras cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsLoadingGenerations(true);
      loadGenerations()
        .then((data) => {
          setGenerations(data);
        })
        .catch((error) => {
          console.error('Error al cargar generaciones:', error);
          setGenerations([]);
        })
        .finally(() => {
          setIsLoadingGenerations(false);
        });

      setIsLoadingCareers(true);
      loadCareers()
        .then((data) => {
          setCareers(data);
        })
        .catch((error) => {
          console.error('Error al cargar carreras:', error);
          setCareers([]);
        })
        .finally(() => {
          setIsLoadingCareers(false);
        });
    }
  }, [isOpen]);

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setGenerationId(initialData.generationId || '');
      setCareerId(initialData.careerId || '');
      setNewAdmissionQuotas(initialData.newAdmissionQuotas || 0);
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setGenerationId('');
      setCareerId('');
      setNewAdmissionQuotas(0);
      setDescription('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!generationId) {
      newErrors.generationId = 'La generación es requerida';
    }

    if (!careerId) {
      newErrors.careerId = 'La carrera es requerida';
    }

    if (newAdmissionQuotas === undefined || newAdmissionQuotas < 0) {
      newErrors.newAdmissionQuotas =
        'El número de cupos debe ser un número positivo';
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
          generationId,
          careerId,
          newAdmissionQuotas,
          description: description.trim() || null,
          isActive,
        });
      } else {
        await onSubmit({
          generationId,
          careerId,
          newAdmissionQuotas,
          description: description.trim() || null,
          isActive,
        });
      }
    } catch (error) {
      console.error('Error al guardar cupo:', error);
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
      title={mode === 'create' ? 'Crear Cupo' : 'Editar Cupo'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Generación *
          </label>
          <select
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
            value={generationId}
            onChange={(e) => {
              setGenerationId(e.target.value);
              if (errors.generationId) {
                setErrors({ ...errors, generationId: undefined });
              }
            }}
            disabled={isSubmitting || isLoadingGenerations}
            required
          >
            <option value="">Seleccionar generación</option>
            {generations.map((generation) => (
              <option key={generation.id} value={generation.id}>
                {generation.name}
              </option>
            ))}
          </select>
          {errors.generationId && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.generationId}
            </span>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Carrera *
          </label>
          <select
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
            value={careerId}
            onChange={(e) => {
              setCareerId(e.target.value);
              if (errors.careerId) {
                setErrors({ ...errors, careerId: undefined });
              }
            }}
            disabled={isSubmitting || isLoadingCareers}
            required
          >
            <option value="">Seleccionar carrera</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
          {errors.careerId && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.careerId}
            </span>
          )}
        </div>

        <Input
          label="Número de cupos *"
          type="number"
          placeholder="Ej: 50"
          value={newAdmissionQuotas.toString()}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            setNewAdmissionQuotas(isNaN(value) ? 0 : value);
            if (errors.newAdmissionQuotas) {
              setErrors({ ...errors, newAdmissionQuotas: undefined });
            }
          }}
          error={errors.newAdmissionQuotas}
          fullWidth
          disabled={isSubmitting}
          required
          min={0}
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
            placeholder="Descripción opcional del cupo"
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
            Cupo activo
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
