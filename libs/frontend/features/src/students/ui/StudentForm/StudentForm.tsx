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
import { CapturedFieldsForm } from '@features/captured-fields';
import { GraduationForm } from '@features/graduations/ui/GraduationForm/GraduationForm';
import { useCapturedFields } from '@features/captured-fields';
import { useGraduations } from '@features/graduations';
import { findCapturedFieldsByStudentId } from '@features/captured-fields/api/studentHelper';
import { findGraduationByStudentId } from '@features/graduations/api/studentHelper';
import type { CapturedFields } from '@entities/captured-fields';
import type { Graduation } from '@entities/graduation';

type TabType = 'personal' | 'process' | 'graduation';

export interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateStudentRequest | UpdateStudentRequest
  ) => Promise<Student | void>;
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
  // Estado de pestañas
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isStudentSaved, setIsStudentSaved] = useState(false);
  const [savedStudentId, setSavedStudentId] = useState<string | null>(null);

  // Estados del formulario de estudiante
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

  // Estados para CapturedFields y Graduation
  const [capturedFieldsData, setCapturedFieldsData] =
    useState<CapturedFields | null>(null);
  const [graduationData, setGraduationData] = useState<Graduation | null>(null);

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

  // Hooks para CapturedFields y Graduations
  const {
    createCapturedFields,
    updateCapturedFields,
    isCreating: isCreatingCapturedFields,
    isUpdating: isUpdatingCapturedFields,
  } = useCapturedFields();

  const {
    createGraduation,
    updateGraduation,
    isCreating: isCreatingGraduation,
    isUpdating: isUpdatingGraduation,
  } = useGraduations();

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

      // El estudiante ya está guardado en modo edición
      setIsStudentSaved(true);
      setSavedStudentId(initialData.id);

      // Cargar datos relacionados (CapturedFields y Graduation)
      // Usar helpers que buscarán por studentId (cuando se refactoricen los mocks)
      Promise.all([
        findCapturedFieldsByStudentId(initialData.id),
        findGraduationByStudentId(initialData.id),
      ])
        .then(([capturedFields, graduation]) => {
          setCapturedFieldsData(capturedFields);
          setGraduationData(graduation);
        })
        .catch((error) => {
          console.error('Error al cargar datos relacionados:', error);
          setCapturedFieldsData(null);
          setGraduationData(null);
        });
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
      setIsStudentSaved(false);
      setSavedStudentId(null);
      setCapturedFieldsData(null);
      setGraduationData(null);
      setActiveTab('personal');
    }
    setErrors({});
  }, [isOpen, mode, initialData]);

  // Resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('personal');
      setIsStudentSaved(false);
      setSavedStudentId(null);
      setCapturedFieldsData(null);
      setGraduationData(null);
    }
  }, [isOpen]);

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

  const handleStudentSubmit = async (e: FormEvent) => {
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

      const savedStudent = await onSubmit(formData);

      // Si es modo creación, el estudiante retornado tiene el ID
      if (mode === 'create' && savedStudent?.id) {
        setIsStudentSaved(true);
        setSavedStudentId(savedStudent.id);
      } else if (mode === 'edit' && initialData?.id) {
        setIsStudentSaved(true);
        setSavedStudentId(initialData.id);
      }

      return savedStudent;
    } catch (error) {
      console.error('Error al guardar estudiante:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndContinue = async (e?: React.MouseEvent) => {
    // Prevenir el submit del formulario si viene de un click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Guardar estudiante y continuar a la siguiente pestaña
    if (!isStudentSaved) {
      try {
        const fakeEvent = {
          preventDefault: () => {},
        } as FormEvent;
        await handleStudentSubmit(fakeEvent);
        // Después de guardar exitosamente, cambiar a la pestaña de proceso
        // El estado se actualiza dentro de handleStudentSubmit
        setActiveTab('process');
      } catch (error) {
        // Error ya manejado en handleStudentSubmit
        console.error('Error al guardar estudiante:', error);
        // No cambiar de tab si hay error
      }
    } else {
      // Si ya está guardado, solo cambiar de tab
      setActiveTab('process');
    }
  };

  const handleCapturedFieldsSubmit = async (data: any): Promise<void> => {
    if (!savedStudentId) return;

    if (capturedFieldsData) {
      const result = await updateCapturedFields(savedStudentId, data);
      if (!result.success) {
        console.error('Error al actualizar campos capturados:', result.error);
        throw new Error(result.error);
      }
      // Recargar datos usando helper
      const updated = await findCapturedFieldsByStudentId(savedStudentId);
      setCapturedFieldsData(updated);
    } else {
      const result = await createCapturedFields(data);
      if (!result.success) {
        console.error('Error al crear campos capturados:', result.error);
        throw new Error(result.error);
      }
      // Recargar datos usando helper (cuando se refactoricen los mocks)
      const created = await findCapturedFieldsByStudentId(savedStudentId);
      setCapturedFieldsData(created);
    }
  };

  const handleGraduationSubmit = async (data: any): Promise<void> => {
    if (!savedStudentId) return;

    if (graduationData) {
      const result = await updateGraduation(savedStudentId, data);
      if (!result.success) {
        console.error('Error al actualizar titulación:', result.error);
        throw new Error(result.error);
      }
      // Recargar datos usando helper
      const updated = await findGraduationByStudentId(savedStudentId);
      setGraduationData(updated);
    } else {
      const result = await createGraduation(data);
      if (!result.success) {
        console.error('Error al crear titulación:', result.error);
        throw new Error(result.error);
      }
      // Recargar datos usando helper (cuando se refactoricen los mocks)
      const created = await findGraduationByStudentId(savedStudentId);
      setGraduationData(created);
    }
  };

  const handleClose = () => {
    if (
      !isSubmitting &&
      !isCreatingCapturedFields &&
      !isUpdatingCapturedFields &&
      !isCreatingGraduation &&
      !isUpdatingGraduation
    ) {
      setErrors({});
      onClose();
    }
  };

  const tabs = [
    { id: 'personal' as TabType, label: 'Datos Personales' },
    { id: 'process' as TabType, label: 'Datos del Proceso' },
    { id: 'graduation' as TabType, label: 'Datos de Titulación' },
  ];

  const isTabDisabled = (tabId: TabType) => {
    if (tabId === 'personal') return false;
    return !isStudentSaved;
  };

  return (
    <Modal
      title={mode === 'create' ? 'Crear Estudiante' : 'Editar Estudiante'}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="xl"
    >
      {/* Pestañas */}
      <div className="flex border-b border-gray-3-light dark:border-gray-6-dark mb-4">
        {tabs.map((tab) => {
          const disabled = isTabDisabled(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !disabled && setActiveTab(tab.id)}
              disabled={disabled}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer
                ${
                  activeTab === tab.id
                    ? 'border-(--color-primary-color) text-(--color-primary-color) dark:brightness-130'
                    : disabled
                    ? 'border-transparent text-(--color-base-secondary-typo) opacity-50 cursor-not-allowed'
                    : 'border-transparent text-(--color-base-secondary-typo) hover:text-(--color-base-primary-typo)'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido según pestaña activa */}
      {activeTab === 'personal' && (
        <form onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
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
              size="small"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={async () => {
                await handleStudentSubmit({
                  preventDefault: () => {},
                } as FormEvent);
                handleClose();
              }}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Guardar y salir
            </Button>
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={handleSaveAndContinue}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Guardar y continuar
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'process' && savedStudentId && (
        <CapturedFieldsForm
          studentId={savedStudentId}
          onSubmit={handleCapturedFieldsSubmit}
          mode={capturedFieldsData ? 'edit' : 'create'}
          initialData={capturedFieldsData}
          isSubmitting={isCreatingCapturedFields || isUpdatingCapturedFields}
          onCancel={handleClose}
          onSaveAndExit={handleClose}
          onSaveAndContinue={() => setActiveTab('graduation')}
        />
      )}

      {activeTab === 'graduation' && savedStudentId && (
        <GraduationForm
          studentId={savedStudentId}
          onSubmit={handleGraduationSubmit}
          mode={graduationData ? 'edit' : 'create'}
          initialData={graduationData}
          isSubmitting={isCreatingGraduation || isUpdatingGraduation}
          onCancel={handleClose}
          onSave={handleClose}
        />
      )}
    </Modal>
  );
}
