import { FormEvent, useState, useEffect } from 'react';
import { Button, Input } from '@shared/ui';
import type {
  CreateCapturedFieldsRequest,
  UpdateCapturedFieldsRequest,
} from '../../model/types';
import type { CapturedFields } from '@entities/captured-fields';

export interface CapturedFieldsFormProps {
  studentId: string;
  onSubmit: (
    data: CreateCapturedFieldsRequest | UpdateCapturedFieldsRequest
  ) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: CapturedFields | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSaveAndExit?: () => void;
  onSaveAndContinue?: () => void;
}

export function CapturedFieldsForm({
  studentId,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
  onCancel,
  onSaveAndExit,
  onSaveAndContinue,
}: CapturedFieldsFormProps) {
  const [processDate, setProcessDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<{
    processDate?: string;
    projectName?: string;
    company?: string;
  }>({});

  // Cargar datos iniciales cuando se abre en modo edición
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Convertir Date a formato YYYY-MM-DD para input type="date"
      if (initialData.processDate) {
        const date =
          initialData.processDate instanceof Date
            ? initialData.processDate
            : new Date(initialData.processDate);
        setProcessDate(date.toISOString().split('T')[0]);
      } else {
        setProcessDate('');
      }
      setProjectName(initialData.projectName || '');
      setCompany(initialData.company || '');
    } else if (mode === 'create') {
      // Resetear formulario en modo creación
      setProcessDate('');
      setProjectName('');
      setCompany('');
    }
    setErrors({});
  }, [mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!processDate) {
      newErrors.processDate = 'La fecha de registro es requerida';
    }

    if (!projectName.trim()) {
      newErrors.projectName = 'El nombre del proyecto es requerido';
    }

    if (!company.trim()) {
      newErrors.company = 'El nombre de la empresa es requerido';
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
      const formData:
        | CreateCapturedFieldsRequest
        | UpdateCapturedFieldsRequest = {
        studentId,
        processDate: processDate,
        projectName: projectName.trim(),
        company: company.trim(),
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar campos capturados:', error);
      throw error;
    }
  };

  const handleSaveAndExit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const formData:
        | CreateCapturedFieldsRequest
        | UpdateCapturedFieldsRequest = {
        studentId,
        processDate: processDate,
        projectName: projectName.trim(),
        company: company.trim(),
      };

      await onSubmit(formData);
      if (onSaveAndExit) {
        onSaveAndExit();
      }
    } catch (error) {
      console.error('Error al guardar campos capturados:', error);
      throw error;
    }
  };

  const handleSaveAndContinue = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const formData:
        | CreateCapturedFieldsRequest
        | UpdateCapturedFieldsRequest = {
        studentId,
        processDate: processDate,
        projectName: projectName.trim(),
        company: company.trim(),
      };

      await onSubmit(formData);
      if (onSaveAndContinue) {
        onSaveAndContinue();
      }
    } catch (error) {
      console.error('Error al guardar campos capturados:', error);
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
            Nombre del Proyecto *
          </label>
          <textarea
            className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60 resize-none"
            placeholder="Ej: Sistema de Gestión de Inventarios"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (errors.projectName) {
                setErrors({ ...errors, projectName: undefined });
              }
            }}
            disabled={isSubmitting}
            required
            rows={3}
          />
          {errors.projectName && (
            <span className="text-sm text-(--color-error-typo) mt-1 block">
              {errors.projectName}
            </span>
          )}
        </div>

        <Input
          label="Fecha de Registro *"
          variant="calendar"
          value={processDate}
          onChange={(e) => {
            setProcessDate(e.target.value);
            if (errors.processDate) {
              setErrors({ ...errors, processDate: undefined });
            }
          }}
          error={errors.processDate}
          fullWidth
          disabled={isSubmitting}
          required
        />

        <Input
          label="Lugar de Residencia *"
          placeholder="Ej: Instituto Tecnológico Superior de los Ríos"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
            if (errors.company) {
              setErrors({ ...errors, company: undefined });
            }
          }}
          error={errors.company}
          fullWidth
          disabled={isSubmitting}
          required
        />
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
        {onSaveAndExit && (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={handleSaveAndExit}
            disabled={isSubmitting}
          >
            Guardar y salir
          </Button>
        )}
        {onSaveAndContinue && (
          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={handleSaveAndContinue}
            disabled={isSubmitting}
          >
            Guardar y continuar
          </Button>
        )}
      </div>
    </form>
  );
}
