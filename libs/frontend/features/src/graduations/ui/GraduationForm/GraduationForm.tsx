import { FormEvent, useState, useEffect } from 'react';
import { Button, Input } from '@shared/ui';
import type {
  CreateGraduationRequest,
  UpdateGraduationRequest,
} from '../../model/types';
import type { Graduation } from '@entities/graduation';
import type { GraduationOption } from '@entities/graduation-option';
import { loadGraduationOptions } from '../../api/graduationOptionsHelper';

export interface GraduationFormProps {
  studentId: string;
  /** Si false, fecha/hora de titulación y datos de cédula se deshabilitan (solo titulados) */
  isStudentGraduated?: boolean;
  onSubmit: (
    data: CreateGraduationRequest | UpdateGraduationRequest
  ) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Graduation | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
}

export function GraduationForm({
  studentId,
  isStudentGraduated = false,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
  onCancel,
  onSave,
}: GraduationFormProps) {
  const [graduationOptionId, setGraduationOptionId] = useState<string>('');
  const [graduationDate, setGraduationDate] = useState('');
  const [graduationTime, setGraduationTime] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardIssueDate, setIdCardIssueDate] = useState('');
  const [president, setPresident] = useState('');
  const [secretary, setSecretary] = useState('');
  const [vocal, setVocal] = useState('');
  const [substituteVocal, setSubstituteVocal] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    graduationOptionId?: string;
    graduationDate?: string;
    graduationTime?: string;
    president?: string;
    secretary?: string;
    vocal?: string;
    substituteVocal?: string;
    notes?: string;
  }>({});
  const [graduationOptions, setGraduationOptions] = useState<
    GraduationOption[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Cargar opciones de graduación
  useEffect(() => {
    setIsLoadingOptions(true);
    loadGraduationOptions()
      .then((data) => {
        setGraduationOptions(data);
      })
      .catch((error) => {
        console.error('Error al cargar opciones de graduación:', error);
        setGraduationOptions([]);
      })
      .finally(() => {
        setIsLoadingOptions(false);
      });
  }, []);

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Convertir Date a formato para inputs separados (date y time)
      if (initialData.graduationDate) {
        const date =
          initialData.graduationDate instanceof Date
            ? initialData.graduationDate
            : new Date(initialData.graduationDate);
        setGraduationDate(date.toISOString().split('T')[0]);
        setGraduationTime(date.toTimeString().slice(0, 5)); // HH:MM
      } else {
        setGraduationDate('');
        setGraduationTime('');
      }
      setGraduationOptionId(initialData.graduationOptionId || '');
      setIdCardNumber(initialData.idCardNumber || '');
      if (initialData.idCardIssueDate) {
        const idDate =
          initialData.idCardIssueDate instanceof Date
            ? initialData.idCardIssueDate
            : new Date(initialData.idCardIssueDate);
        setIdCardIssueDate(idDate.toISOString().split('T')[0]);
      } else {
        setIdCardIssueDate('');
      }
      setPresident(initialData.president || '');
      setSecretary(initialData.secretary || '');
      setVocal(initialData.vocal || '');
      setSubstituteVocal(initialData.substituteVocal || '');
      setNotes(initialData.notes || '');
    } else if (mode === 'create') {
      // Resetear formulario en modo creación
      setGraduationOptionId('');
      setGraduationDate('');
      setGraduationTime('');
      setIdCardNumber('');
      setIdCardIssueDate('');
      setPresident('');
      setSecretary('');
      setVocal('');
      setSubstituteVocal('');
      setNotes('');
    }
    setErrors({});
  }, [mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!graduationOptionId.trim()) {
      newErrors.graduationOptionId = 'La opción de titulación es requerida';
    }

    if (isStudentGraduated && !graduationDate.trim()) {
      newErrors.graduationDate = 'La fecha de titulación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formData: CreateGraduationRequest | UpdateGraduationRequest = {
        studentId,
        graduationOptionId: graduationOptionId.trim(),
        president: president.trim(),
        secretary: secretary.trim(),
        vocal: vocal.trim(),
        substituteVocal: substituteVocal.trim(),
        notes: notes.trim() || null,
      };

      if (isStudentGraduated && graduationDate.trim()) {
        const timePart = graduationTime.trim()
          ? `${graduationTime.trim()}:00`
          : '00:00:00';
        const dateTime = new Date(`${graduationDate.trim()}T${timePart}`);
        formData.graduationDate = dateTime.toISOString();
        formData.idCardNumber = idCardNumber.trim() || undefined;
        formData.idCardIssueDate = idCardIssueDate || undefined;
      } else if (mode === 'create') {
        (formData as CreateGraduationRequest).graduationDate = '';
      }

      await onSubmit(formData);
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error al guardar titulación:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Opción de Titulación *
          </label>
          <select
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
            value={graduationOptionId}
            onChange={(e) => {
              setGraduationOptionId(e.target.value);
              if (errors.graduationOptionId) {
                setErrors({ ...errors, graduationOptionId: undefined });
              }
            }}
            disabled={isSubmitting || isLoadingOptions}
          >
            <option value="">Seleccionar opción de titulación</option>
            {graduationOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.graduationOptionId && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.graduationOptionId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Titulación *"
            variant="calendar"
            value={graduationDate}
            onChange={(e) => {
              setGraduationDate(e.target.value);
              if (errors.graduationDate) {
                setErrors({ ...errors, graduationDate: undefined });
              }
            }}
            error={errors.graduationDate}
            fullWidth
            disabled={isSubmitting || !isStudentGraduated}
            required={isStudentGraduated}
            placeholder={
              !isStudentGraduated ? 'Solo para titulados' : undefined
            }
          />

          <Input
            label="Hora de Titulación"
            type="time"
            value={graduationTime}
            onChange={(e) => {
              setGraduationTime(e.target.value);
              if (errors.graduationTime) {
                setErrors({ ...errors, graduationTime: undefined });
              }
            }}
            error={errors.graduationTime}
            fullWidth
            disabled={isSubmitting || !isStudentGraduated}
            placeholder={
              !isStudentGraduated ? 'Solo para titulados' : undefined
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número de Cédula"
            placeholder={
              isStudentGraduated ? 'Ej: CED-2024-001234' : 'Solo para titulados'
            }
            value={idCardNumber}
            onChange={(e) => setIdCardNumber(e.target.value)}
            fullWidth
            disabled={isSubmitting || !isStudentGraduated}
          />

          <Input
            label="Fecha de Emisión de Cédula"
            variant="calendar"
            value={idCardIssueDate}
            onChange={(e) => setIdCardIssueDate(e.target.value)}
            fullWidth
            disabled={isSubmitting || !isStudentGraduated}
            placeholder={
              !isStudentGraduated ? 'Solo para titulados' : undefined
            }
          />
        </div>

        <Input
          label="Presidente del Comité"
          placeholder="Ej: Dr. Carlos Ramírez García"
          value={president}
          onChange={(e) => {
            setPresident(e.target.value);
            if (errors.president) {
              setErrors({ ...errors, president: undefined });
            }
          }}
          error={errors.president}
          fullWidth
          disabled={isSubmitting}
        />

        <Input
          label="Secretario del Comité"
          placeholder="Ej: Mtra. Ana Martínez López"
          value={secretary}
          onChange={(e) => {
            setSecretary(e.target.value);
            if (errors.secretary) {
              setErrors({ ...errors, secretary: undefined });
            }
          }}
          error={errors.secretary}
          fullWidth
          disabled={isSubmitting}
        />

        <Input
          label="Vocal del Comité"
          placeholder="Ej: Ing. Luis Sánchez Pérez"
          value={vocal}
          onChange={(e) => {
            setVocal(e.target.value);
            if (errors.vocal) {
              setErrors({ ...errors, vocal: undefined });
            }
          }}
          error={errors.vocal}
          fullWidth
          disabled={isSubmitting}
        />

        <Input
          label="Vocal Suplente del Comité"
          placeholder="Ej: Dra. María González Hernández"
          value={substituteVocal}
          onChange={(e) => {
            setSubstituteVocal(e.target.value);
            if (errors.substituteVocal) {
              setErrors({ ...errors, substituteVocal: undefined });
            }
          }}
          error={errors.substituteVocal}
          fullWidth
          disabled={isSubmitting}
        />

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Notas
          </label>
          <textarea
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            placeholder="Notas adicionales (opcional)"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (errors.notes) {
                setErrors({ ...errors, notes: undefined });
              }
            }}
            disabled={isSubmitting}
            rows={4}
          />
          {errors.notes && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.notes}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="small"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
}
