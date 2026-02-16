import React, { useState, useCallback } from 'react';
import { Modal, Button, Input } from '@shared/ui';
import { studentsService } from '../../api/studentsService';
import { useToast } from '@shared/ui';
import type { Student } from '@entities/student';
import type { UpdateProcessStatusRequest } from '../../model/types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess?: () => void; // Callback para actualizar datos después de programar
}

export function ScheduleModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: ScheduleModalProps) {
  const { showToast } = useToast();
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  const handleModalClose = useCallback(() => {
    setScheduledDate('');
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Manejar cambio de fecha
  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setScheduledDate(e.target.value);
    },
    []
  );

  // Manejar envío del formulario
  const handleSubmit = useCallback(async () => {
    if (!student) return;

    // Validar que se haya seleccionado una fecha
    if (!scheduledDate) {
      showToast({
        type: 'error',
        title: 'Error de validación',
        message: 'Debe seleccionar una fecha de programación',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: UpdateProcessStatusRequest = {
        processStatus: 'SCHEDULED' as any,
        scheduledDate: new Date(scheduledDate).toISOString(),
      };

      await studentsService.updateProcessStatus(student.id, requestData);

      showToast({
        type: 'success',
        title: 'Programación exitosa',
        message: 'El estudiante ha sido programado correctamente',
      });

      handleModalClose();

      // Llamar al callback para actualizar datos
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al programar estudiante:', error);
      showToast({
        type: 'error',
        title: 'Error al programar estudiante',
        message:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al programar al estudiante',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [student, scheduledDate, showToast, handleModalClose]);

  // Establecer fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Programar Estudiante"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Información del estudiante */}
        <div className="bg-gray-2-light dark:bg-gray-3-dark p-4 rounded-lg border border-gray-3-light dark:border-gray-6-dark">
          <h3
            className="font-semibold text-lg mb-2"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Información del Estudiante
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span
                className="font-medium"
                style={{ color: 'var(--color-base-primary-typo)' }}
              >
                Nombre:
              </span>
              <p className="text-gray-4-light dark:text-gray-5-dark">
                {student
                  ? `${student.firstName} ${student.paternalLastName} ${student.maternalLastName}`
                  : ''}
              </p>
            </div>
            <div>
              <span
                className="font-medium"
                style={{ color: 'var(--color-base-primary-typo)' }}
              >
                Número de Control:
              </span>
              <p className="text-gray-4-light dark:text-gray-5-dark">
                {student?.controlNumber || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de programación */}
        <div className="space-y-4">
          <h3
            className="font-semibold text-lg"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Programación de Titulación
          </h3>

          <Input
            label="Fecha Programada"
            type="date"
            value={scheduledDate}
            onChange={handleDateChange}
            min={today}
            required
            disabled={isSubmitting}
            placeholder="Seleccione la fecha de programación"
          />

          <div className="text-sm text-gray-4-light dark:text-gray-5-dark">
            <p>
              • Seleccione la fecha en que se programará la sesión de
              titulación.
            </p>
            <p>• La fecha debe ser igual o posterior a hoy.</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-3-light dark:border-gray-6-dark">
          <Button
            variant="ghost"
            size="small"
            onClick={handleModalClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !scheduledDate}
            isLoading={isSubmitting}
            size="small"
          >
            {isSubmitting ? 'Programando...' : 'Programar Estudiante'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
