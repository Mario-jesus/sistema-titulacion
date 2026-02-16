import React, { useCallback, useState } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import { useToast } from '@shared/ui';
import type { Student } from '@entities/student';
import { studentsService } from '../../api/studentsService';
import type { UpdateProcessStatusRequest } from '../../model/types';

interface GraduateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess?: () => void;
}

export function GraduateModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: GraduateModalProps) {
  const { showToast } = useToast();
  const [graduationDate, setGraduationDate] = useState('');
  const [hasIdCard, setHasIdCard] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState('');
  const [idCardIssueDate, setIdCardIssueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModalClose = useCallback(() => {
    setGraduationDate('');
    setHasIdCard(false);
    setIdCardNumber('');
    setIdCardIssueDate('');
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handleGraduationDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGraduationDate(e.target.value);
    },
    []
  );

  const handleIdCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIdCardNumber(e.target.value);
    },
    []
  );

  const handleIdCardIssueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIdCardIssueDate(e.target.value);
    },
    []
  );

  const handleHasIdCardChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setHasIdCard(checked);
      if (!checked) {
        setIdCardNumber('');
        setIdCardIssueDate('');
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!student) return;

    if (!graduationDate) {
      showToast({
        type: 'error',
        title: 'Error de validación',
        message: 'Debe seleccionar una fecha de titulación',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: UpdateProcessStatusRequest = {
        processStatus: 'GRADUATED' as any,
        graduationDate: new Date(graduationDate).toISOString(),
        hasIdCard,
        idCardNumber: hasIdCard ? idCardNumber || undefined : undefined,
        idCardIssueDate:
          hasIdCard && idCardIssueDate
            ? new Date(idCardIssueDate).toISOString()
            : undefined,
      };

      await studentsService.updateProcessStatus(student.id, requestData);

      showToast({
        type: 'success',
        title: 'Graduación exitosa',
        message: 'El estudiante ha sido titulado correctamente',
      });

      handleModalClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al titular estudiante:', error);
      showToast({
        type: 'error',
        title: 'Error al titular estudiante',
        message:
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado al titular al estudiante',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    student,
    graduationDate,
    hasIdCard,
    idCardNumber,
    idCardIssueDate,
    onSuccess,
    showToast,
    handleModalClose,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Titular Estudiante"
      maxWidth="md"
    >
      <div className="space-y-6">
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

        <div className="space-y-4">
          <h3
            className="font-semibold text-lg"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Datos de Titulación
          </h3>

          <Input
            label="Fecha de Titulación"
            type="date"
            value={graduationDate}
            onChange={handleGraduationDateChange}
            required
            disabled={isSubmitting}
            placeholder="Seleccione la fecha de titulación"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasIdCard"
              checked={hasIdCard}
              onChange={handleHasIdCardChange}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label
              htmlFor="hasIdCard"
              className="text-sm"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Cuenta con cédula profesional
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Cédula (opcional)"
              value={idCardNumber}
              onChange={handleIdCardNumberChange}
              disabled={isSubmitting || !hasIdCard}
              placeholder="Ej: CED-2024-000123"
            />
            <Input
              label="Fecha de Emisión (opcional)"
              type="date"
              value={idCardIssueDate}
              onChange={handleIdCardIssueDateChange}
              disabled={isSubmitting || !hasIdCard}
              placeholder="Seleccione la fecha"
            />
          </div>

          <div className="text-sm text-gray-4-light dark:text-gray-5-dark">
            <p>• La fecha de titulación es obligatoria.</p>
            <p>• Si cuenta con cédula, los datos son opcionales.</p>
          </div>
        </div>

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
            disabled={isSubmitting || !graduationDate}
            isLoading={isSubmitting}
            size="small"
          >
            {isSubmitting ? 'Titulando...' : 'Titular Estudiante'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
