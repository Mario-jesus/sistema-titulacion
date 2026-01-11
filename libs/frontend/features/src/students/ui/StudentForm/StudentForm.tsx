import { FormEvent, useState, useEffect } from 'react';
import { Button, Input, Modal } from '@shared/ui';
import type {
  CreateStudentRequest,
  UpdateStudentRequest,
} from '../../model/types';
import type { Student } from '@entities/student';
import { Sex, StudentStatus } from '@entities/student';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';

export interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStudentRequest | UpdateStudentRequest
  ) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Student | null;
}

export function StudentForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: StudentFormProps) {
  const [controlNumber, setControlNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [paternalLastName, setPaternalLastName] = useState('');
  const [maternalLastName, setMaternalLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex>(Sex.MASCULINO);
  const [isEgressed, setIsEgressed] = useState(true);
  const [status, setStatus] = useState<StudentStatus>(StudentStatus.ACTIVO);
  const [generationId, setGenerationId] = useState('');
  const [careerId, setCareerId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);
  const [errors, setErrors] = useState<{
    controlNumber?: string;
    firstName?: string;
    paternalLastName?: string;
    maternalLastName?: string;
    phoneNumber?: string;
    email?: string;
    birthDate?: string;
    sex?: string;
    generationId?: string;
    careerId?: string;
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
      setControlNumber(initialData.controlNumber || '');
      setFirstName(initialData.firstName || '');
      setPaternalLastName(initialData.paternalLastName || '');
      setMaternalLastName(initialData.maternalLastName || '');
      setPhoneNumber(initialData.phoneNumber || '');
      setEmail(initialData.email || '');
      // Convertir Date a formato YYYY-MM-DD para input type="date"
      if (initialData.birthDate) {
        const date =
          initialData.birthDate instanceof Date
            ? initialData.birthDate
            : new Date(initialData.birthDate);
        setBirthDate(date.toISOString().split('T')[0]);
      } else {
        setBirthDate('');
      }
      setSex(initialData.sex || Sex.MASCULINO);
      setIsEgressed(initialData.isEgressed || false);
      setStatus(initialData.status || StudentStatus.ACTIVO);
      setGenerationId(initialData.generationId || '');
      setCareerId(initialData.careerId || '');
    } else if (isOpen && mode === 'create') {
      // Resetear formulario en modo creación
      setControlNumber('');
      setFirstName('');
      setPaternalLastName('');
      setMaternalLastName('');
      setPhoneNumber('');
      setEmail('');
      setBirthDate('');
      setSex(Sex.MASCULINO);
      setIsEgressed(true);
      setStatus(StudentStatus.ACTIVO);
      setGenerationId('');
      setCareerId('');
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!controlNumber.trim()) {
      newErrors.controlNumber = 'El número de control es requerido';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!paternalLastName.trim()) {
      newErrors.paternalLastName = 'El apellido paterno es requerido';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'El email no es válido';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'El teléfono es requerido';
    }

    if (!birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!generationId) {
      newErrors.generationId = 'La generación es requerida';
    }

    if (!careerId) {
      newErrors.careerId = 'La carrera es requerida';
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
      const formData: CreateStudentRequest | UpdateStudentRequest = {
        controlNumber: controlNumber.trim(),
        firstName: firstName.trim(),
        paternalLastName: paternalLastName.trim(),
        maternalLastName: maternalLastName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        birthDate: birthDate,
        sex,
        isEgressed,
        status,
        generationId,
        careerId,
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
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
      title={mode === 'create' ? 'Crear Estudiante' : 'Editar Estudiante'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Número de Control *"
            placeholder="Ej: 20200001"
            value={controlNumber}
            onChange={(e) => {
              setControlNumber(e.target.value);
              if (errors.controlNumber) {
                setErrors({ ...errors, controlNumber: undefined });
              }
            }}
            error={errors.controlNumber}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <Input
            label="Nombre *"
            placeholder="Ej: Juan"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) {
                setErrors({ ...errors, firstName: undefined });
              }
            }}
            error={errors.firstName}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <Input
            label="Apellido Paterno *"
            placeholder="Ej: Pérez"
            value={paternalLastName}
            onChange={(e) => {
              setPaternalLastName(e.target.value);
              if (errors.paternalLastName) {
                setErrors({ ...errors, paternalLastName: undefined });
              }
            }}
            error={errors.paternalLastName}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <Input
            label="Apellido Materno"
            placeholder="Ej: García"
            value={maternalLastName}
            onChange={(e) => {
              setMaternalLastName(e.target.value);
              if (errors.maternalLastName) {
                setErrors({ ...errors, maternalLastName: undefined });
              }
            }}
            error={errors.maternalLastName}
            fullWidth
            disabled={isSubmitting}
          />

          <Input
            label="Teléfono *"
            placeholder="Ej: +52 1234567890"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (errors.phoneNumber) {
                setErrors({ ...errors, phoneNumber: undefined });
              }
            }}
            error={errors.phoneNumber}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <Input
            label="Email *"
            type="email"
            placeholder="Ej: juan.perez@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            error={errors.email}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <Input
            label="Fecha de Nacimiento *"
            variant="calendar"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              if (errors.birthDate) {
                setErrors({ ...errors, birthDate: undefined });
              }
            }}
            error={errors.birthDate}
            fullWidth
            disabled={isSubmitting}
            required
          />

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Sexo *
            </label>
            <select
              className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
              value={sex}
              onChange={(e) => {
                setSex(e.target.value as Sex);
                if (errors.sex) {
                  setErrors({ ...errors, sex: undefined });
                }
              }}
              disabled={isSubmitting}
              required
            >
              <option value={Sex.MASCULINO}>Masculino</option>
              <option value={Sex.FEMENINO}>Femenino</option>
            </select>
            {errors.sex && (
              <span className="text-sm text-(--color-error-typo) mt-1 block">
                {errors.sex}
              </span>
            )}
          </div>

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

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Estado *
            </label>
            <select
              className="w-full px-4 py-3 text-base font-inherit text-(--color-base-primary-typo) bg-(--color-input-bg) border border-(--color-input-border) rounded-lg outline-none focus:border-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 disabled:bg-(--color-gray-2) disabled:cursor-not-allowed disabled:opacity-60"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StudentStatus);
              }}
              disabled={isSubmitting}
              required
            >
              <option value={StudentStatus.ACTIVO}>Activo</option>
              <option value={StudentStatus.PAUSADO}>Pausado</option>
              <option value={StudentStatus.CANCELADO}>Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isEgressed"
            checked={isEgressed}
            onChange={(e) => setIsEgressed(e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-(--color-input-border) text-(--color-primary-color) focus:ring-2 focus:ring-(--color-primary-color) focus:ring-opacity-10 cursor-pointer"
          />
          <label
            htmlFor="isEgressed"
            className="text-sm cursor-pointer"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Estudiante egresado
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
