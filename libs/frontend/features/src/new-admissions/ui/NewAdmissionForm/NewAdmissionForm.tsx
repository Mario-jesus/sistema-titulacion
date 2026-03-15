import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type {
  CreateNewAdmissionRequest,
  UpdateNewAdmissionRequest,
} from '../../model/types';
import type { NewAdmission } from '@entities/new-admission';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';

export interface NewAdmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateNewAdmissionRequest | UpdateNewAdmissionRequest
  ) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: NewAdmission | null;
}

export function NewAdmissionForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: NewAdmissionFormProps) {
  const [generationId, setGenerationId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
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
    maleCount?: string;
    femaleCount?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setIsLoadingGenerations(true);
      loadGenerations()
        .then((data) => setGenerations(data))
        .catch((error) => {
          console.error('Error al cargar generaciones:', error);
          setGenerations([]);
        })
        .finally(() => setIsLoadingGenerations(false));

      setIsLoadingCareers(true);
      loadCareers()
        .then((data) => setCareers(data))
        .catch((error) => {
          console.error('Error al cargar carreras:', error);
          setCareers([]);
        })
        .finally(() => setIsLoadingCareers(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setGenerationId(initialData.generationId || '');
      setCareerId(initialData.careerId || '');
      setMaleCount(initialData.maleCount || 0);
      setFemaleCount(initialData.femaleCount || 0);
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive);
    } else if (isOpen && mode === 'create') {
      setGenerationId('');
      setCareerId('');
      setMaleCount(0);
      setFemaleCount(0);
      setDescription('');
      setIsActive(true);
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!generationId) newErrors.generationId = 'La generación es requerida';
    if (!careerId) newErrors.careerId = 'La carrera es requerida';
    if (maleCount === undefined || maleCount < 0) {
      newErrors.maleCount =
        'El número de alumnos hombres debe ser un número positivo';
    }
    if (femaleCount === undefined || femaleCount < 0) {
      newErrors.femaleCount =
        'El número de alumnas mujeres debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        generationId,
        careerId,
        maleCount,
        femaleCount,
        description: description.trim() || null,
        isActive,
      });
    } catch (error) {
      console.error('Error al guardar registro:', error);
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
          ? 'Registrar Nuevo Ingreso'
          : 'Editar Registro de Ingreso'
      }
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
              if (errors.generationId)
                setErrors({ ...errors, generationId: undefined });
            }}
            disabled={isSubmitting || isLoadingGenerations}
            required
          >
            <option value="">Seleccionar generación</option>
            {generations.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
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
              if (errors.careerId)
                setErrors({ ...errors, careerId: undefined });
            }}
            disabled={isSubmitting || isLoadingCareers}
            required
          >
            <option value="">Seleccionar carrera</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.careerId && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.careerId}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Alumnos por Sexo *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Alumnos Hombres *"
                type="number"
                placeholder="Ej: 30"
                value={maleCount.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setMaleCount(isNaN(value) ? 0 : value);
                  if (errors.maleCount)
                    setErrors({ ...errors, maleCount: undefined });
                }}
                error={errors.maleCount}
                disabled={isSubmitting}
                required
                min={0}
              />
              <Input
                label="Alumnas Mujeres *"
                type="number"
                placeholder="Ej: 20"
                value={femaleCount.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setFemaleCount(isNaN(value) ? 0 : value);
                  if (errors.femaleCount)
                    setErrors({ ...errors, femaleCount: undefined });
                }}
                error={errors.femaleCount}
                disabled={isSubmitting}
                required
                min={0}
              />
            </div>
            <div
              className="mt-2 text-sm"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Total: {(maleCount + femaleCount).toLocaleString()} alumnos
            </div>
          </div>
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
            placeholder="Descripción opcional del registro"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors({ ...errors, description: undefined });
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
            Registro activo
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
