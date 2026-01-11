import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import {
  Table,
  Button,
  useToast,
  FilterDropdown,
  createStatusActions,
  Pagination,
} from '@shared/ui';
import { DetailModal } from '@shared/ui';
import type { DropdownMenuItem, FilterConfig } from '@shared/ui';
import { useStudents } from '../../lib/useStudents';
import { StudentForm } from '../StudentForm/StudentForm';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';
import { findCapturedFieldsByStudentId } from '@features/captured-fields/api/studentHelper';
import { findGraduationByStudentId } from '@features/graduations/api/studentHelper';
import { loadGraduationOptions } from '@features/graduations/api/graduationOptionsHelper';
import type { Student } from '@entities/student';
import { StudentStatus } from '@entities/student';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import type { TableColumn, DetailField } from '@shared/ui';
import type { CapturedFields } from '@entities/captured-fields';
import type { Graduation } from '@entities/graduation';

export interface StudentsListProps {
  /**
   * Filtro por defecto para status
   * Si es 'in-progress', filtra por ACTIVO o PAUSADO
   */
  defaultStatusFilter?: 'in-progress' | 'graduated' | null;
  /**
   * Si es true, solo muestra estudiantes titulados (isEgressed = true)
   */
  graduatedOnly?: boolean;
}

/**
 * Componente para listar y gestionar estudiantes
 * Contiene toda la lógica de negocio y UI para la gestión de estudiantes
 */
export function StudentsList({
  defaultStatusFilter = null,
  graduatedOnly = false,
}: StudentsListProps = {}) {
  const { showToast } = useToast();
  const {
    students,
    pagination,
    isLoadingList,
    listError,
    listStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
    clearListErrors,
  } = useStudents();

  // Estados para relaciones
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [graduationOptions, setGraduationOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCapturedFields, setSelectedCapturedFields] =
    useState<CapturedFields | null>(null);
  const [selectedGraduation, setSelectedGraduation] =
    useState<Graduation | null>(null);
  const [_isLoadingDetailData, setIsLoadingDetailData] = useState(false);

  // Cargar generaciones, carreras y opciones de graduación al montar
  useEffect(() => {
    loadGenerations()
      .then((data) => {
        setGenerations(data);
      })
      .catch((error) => {
        console.error('Error al cargar generaciones:', error);
      });

    loadCareers()
      .then((data) => {
        setCareers(data);
      })
      .catch((error) => {
        console.error('Error al cargar carreras:', error);
      });

    loadGraduationOptions()
      .then((data) => {
        setGraduationOptions(
          data.map((opt) => ({ id: opt.id, name: opt.name }))
        );
      })
      .catch((error) => {
        console.error('Error al cargar opciones de graduación:', error);
      });
  }, []);

  // Helper para obtener nombre de generación
  const getGenerationName = useCallback(
    (generationId: string) => {
      const generation = generations.find((g) => g.id === generationId);
      return generation?.name || generationId;
    },
    [generations]
  );

  // Helper para obtener nombre de carrera
  const getCareerName = useCallback(
    (careerId: string) => {
      const career = careers.find((c) => c.id === careerId);
      return career?.name || careerId;
    },
    [careers]
  );

  // Helper para obtener nombre de opción de graduación
  const getGraduationOptionName = useCallback(
    (graduationOptionId: string | null) => {
      if (!graduationOptionId) return '—';
      const option = graduationOptions.find(
        (opt) => opt.id === graduationOptionId
      );
      return option?.name || graduationOptionId;
    },
    [graduationOptions]
  );

  // Cargar estudiantes
  const loadStudents = useCallback(async () => {
    try {
      // Para "En proceso", necesitamos cargar más estudiantes y filtrar en frontend
      // porque el API solo acepta un status a la vez
      const limit = defaultStatusFilter === 'in-progress' ? 1000 : 10;

      const params: any = {
        page: defaultStatusFilter === 'in-progress' ? 1 : page,
        limit,
        search: searchTerm || undefined,
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
        ...(filters.careerId ? { careerId: filters.careerId as string } : {}),
        ...(filters.generationId
          ? { generationId: filters.generationId as string }
          : {}),
        // Solo aplicar filtro de status si no hay filtro especial activo
        ...(!defaultStatusFilter && filters.status
          ? { status: filters.status as StudentStatus }
          : {}),
        // Aplicar filtro de isEgressed según las props o filtros manuales
        ...(graduatedOnly || filters.isEgressed === true
          ? { isEgressed: true }
          : filters.isEgressed === false
          ? { isEgressed: false }
          : {}),
      };

      await listStudents(params);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      showToast({
        type: 'error',
        title: 'Error al cargar estudiantes',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los estudiantes',
      });
    }
  }, [
    page,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    defaultStatusFilter,
    graduatedOnly,
    listStudents,
    showToast,
  ]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filtrar estudiantes en el frontend si es necesario (para "En proceso")
  // y aplicar paginación manual
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Aplicar filtro de "En proceso" si está activo
    if (defaultStatusFilter === 'in-progress') {
      filtered = filtered.filter(
        (student) =>
          student.status === StudentStatus.ACTIVO ||
          student.status === StudentStatus.PAUSADO
      );

      // Aplicar paginación manual
      const limit = 10;
      const offset = (page - 1) * limit;
      filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
  }, [students, defaultStatusFilter, page]);

  // Calcular paginación manual para "En proceso"
  const manualPagination = useMemo(() => {
    if (defaultStatusFilter === 'in-progress') {
      const limit = 10;
      const filtered = students.filter(
        (student) =>
          student.status === StudentStatus.ACTIVO ||
          student.status === StudentStatus.PAUSADO
      );
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const currentPage = Math.min(page, totalPages);
      return {
        page: currentPage,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        total,
        limit,
      };
    }
    return null;
  }, [students, defaultStatusFilter, page]);

  // Manejar búsqueda
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Manejar ordenamiento
  const handleSort = useCallback(
    (columnKey: string, direction: 'asc' | 'desc' | null) => {
      if (direction === null) {
        setSortBy(null);
        setSortOrder(null);
      } else {
        setSortBy(columnKey);
        setSortOrder(direction);
      }
      setPage(1);
    },
    []
  );

  // Manejar crear
  const handleCreate = useCallback(
    async (data: any) => {
      const result = await createStudent(data);

      if (!result.success) {
        console.error('Error al crear estudiante:', result.error);
        showToast({
          type: 'error',
          title: 'Error al crear estudiante',
          message: result.error,
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Estudiante creado',
        message: 'El estudiante se ha creado exitosamente',
      });
      loadStudents();
      return result.data;
    },
    [createStudent, loadStudents, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedStudent) return;

      const result = await updateStudent(selectedStudent.id, data);

      if (!result.success) {
        console.error('Error al actualizar estudiante:', result.error);
        showToast({
          type: 'error',
          title: 'Error al actualizar estudiante',
          message: result.error,
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Estudiante actualizado',
        message: 'El estudiante se ha actualizado exitosamente',
      });
      loadStudents();
      return result.data;
    },
    [selectedStudent, updateStudent, loadStudents, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (student: Student) => {
      const fullName =
        `${student.firstName} ${student.paternalLastName} ${student.maternalLastName}`.trim();
      if (
        !window.confirm(
          `¿Estás seguro de eliminar al estudiante "${fullName}" (${student.controlNumber})?`
        )
      ) {
        return;
      }
      const result = await deleteStudent(student.id);

      if (!result.success) {
        console.error('Error al eliminar estudiante:', result.error);
        showToast({
          type: 'error',
          title: 'Error al eliminar estudiante',
          message: result.error,
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Estudiante eliminado',
        message: `El estudiante "${fullName}" se ha eliminado exitosamente`,
      });
      loadStudents();
    },
    [deleteStudent, loadStudents, showToast]
  );

  // Manejar cambio de status
  const handleStatusChange = useCallback(
    async (student: Student, newStatus: StudentStatus) => {
      const result = await changeStudentStatus(student.id, newStatus);

      if (!result.success) {
        console.error('Error al cambiar estado:', result.error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message: result.error,
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Estado actualizado',
        message: `El estado del estudiante se ha actualizado a ${newStatus}`,
      });
      loadStudents();
    },
    [changeStudentStatus, loadStudents, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback(async (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
    setIsLoadingDetailData(true);

    // Cargar datos relacionados
    try {
      const [capturedFields, graduation] = await Promise.all([
        findCapturedFieldsByStudentId(student.id),
        findGraduationByStudentId(student.id),
      ]);
      setSelectedCapturedFields(capturedFields);
      setSelectedGraduation(graduation);
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
      setSelectedCapturedFields(null);
      setSelectedGraduation(null);
    } finally {
      setIsLoadingDetailData(false);
    }
  }, []);

  // Obtener label del status
  const getStatusLabel = useCallback((status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ACTIVO:
        return 'Activo';
      case StudentStatus.PAUSADO:
        return 'Pausado';
      case StudentStatus.CANCELADO:
        return 'Cancelado';
      default:
        return status;
    }
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<Student>[] = [
    {
      key: 'controlNumber',
      label: 'Número de Control',
      sortable: true,
    },
    {
      key: 'firstName',
      label: 'Nombre Completo',
      render: (_value: any, row: Student) => {
        const fullName =
          `${row.firstName} ${row.paternalLastName} ${row.maternalLastName}`.trim();
        return fullName || '-';
      },
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'generationId',
      label: 'Generación',
      render: (value: string) => getGenerationName(value),
    },
    {
      key: 'careerId',
      label: 'Carrera',
      render: (value: string) => getCareerName(value),
    },
    {
      key: 'isEgressed',
      label: 'Egresado',
      render: (value: boolean) => (
        <span
          className={
            value ? 'text-(--color-green) font-medium' : 'text-(--color-yellow)'
          }
        >
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (value: StudentStatus) => {
        let statusColor = 'text-(--color-green)';
        if (value === StudentStatus.PAUSADO) {
          statusColor = 'text-(--color-yellow)';
        } else if (value === StudentStatus.CANCELADO) {
          statusColor = 'text-(--color-salmon)';
        }
        return (
          <span className={`${statusColor} font-medium`}>
            {getStatusLabel(value)}
          </span>
        );
      },
    },
  ];

  // Campos para el modal de detalles (incluyendo CapturedFields y Graduation)
  const detailFields: DetailField<any>[] = useMemo(() => {
    const fields: DetailField<any>[] = [
      {
        key: 'controlNumber',
        label: 'Número de Control',
      },
      {
        key: 'firstName',
        label: 'Nombre',
      },
      {
        key: 'paternalLastName',
        label: 'Apellido Paterno',
      },
      {
        key: 'maternalLastName',
        label: 'Apellido Materno',
      },
      {
        key: 'email',
        label: 'Email',
      },
      {
        key: 'phoneNumber',
        label: 'Teléfono',
      },
      {
        key: 'birthDate',
        label: 'Fecha de Nacimiento',
        render: (value: Date | string) => {
          const date = value instanceof Date ? value : new Date(value);
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      },
      {
        key: 'sex',
        label: 'Sexo',
        render: (value: string) =>
          value === 'MASCULINO' ? 'Masculino' : 'Femenino',
      },
      {
        key: 'generationId',
        label: 'Generación',
        render: (value: string) => getGenerationName(value),
      },
      {
        key: 'careerId',
        label: 'Carrera',
        render: (value: string) => getCareerName(value),
      },
      {
        key: 'status',
        label: 'Estado',
        render: (value: StudentStatus) => {
          let statusColor = 'text-(--color-green)';
          if (value === StudentStatus.PAUSADO) {
            statusColor = 'text-(--color-yellow)';
          } else if (value === StudentStatus.CANCELADO) {
            statusColor = 'text-(--color-salmon)';
          }
          return (
            <span className={`${statusColor} font-medium`}>
              {getStatusLabel(value)}
            </span>
          );
        },
      },
      {
        key: 'isEgressed',
        label: 'Egresado',
        render: (value: boolean) => (
          <span
            className={
              value
                ? 'text-(--color-green) font-medium'
                : 'text-(--color-yellow)'
            }
          >
            {value ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Fecha de Creación',
        render: (value: Date | string) => {
          const date = value instanceof Date ? value : new Date(value);
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      },
      {
        key: 'updatedAt',
        label: 'Última Actualización',
        render: (value: Date | string) => {
          const date = value instanceof Date ? value : new Date(value);
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      },
    ];

    // Separador y campos de CapturedFields
    fields.push({
      key: '__separator_1__',
      label: '',
      isSeparator: true,
    });

    fields.push(
      {
        key: '__capturedFields_projectName__',
        label: 'Nombre del Proyecto',
        render: () => selectedCapturedFields?.projectName || '—',
      },
      {
        key: '__capturedFields_company__',
        label: 'Empresa',
        render: () => selectedCapturedFields?.company || '—',
      },
      {
        key: '__capturedFields_processDate__',
        label: 'Fecha del Proceso',
        render: () => {
          if (!selectedCapturedFields?.processDate) return '—';
          const date =
            selectedCapturedFields.processDate instanceof Date
              ? selectedCapturedFields.processDate
              : new Date(selectedCapturedFields.processDate);
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        },
      }
    );

    // Separador y campos de Graduation
    fields.push({
      key: '__separator_2__',
      label: '',
      isSeparator: true,
    });

    fields.push(
      {
        key: '__graduation_graduationOptionId__',
        label: 'Opción de Titulación',
        render: () =>
          getGraduationOptionName(
            selectedGraduation?.graduationOptionId ?? null
          ),
      },
      {
        key: '__graduation_graduationDate__',
        label: 'Fecha de Titulación',
        render: () => {
          if (!selectedGraduation?.graduationDate) return '—';
          const date =
            selectedGraduation.graduationDate instanceof Date
              ? selectedGraduation.graduationDate
              : new Date(selectedGraduation.graduationDate);
          return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        },
      },
      {
        key: '__graduation_isGraduated__',
        label: 'Titulado',
        render: () => (
          <span
            className={
              selectedGraduation?.isGraduated
                ? 'text-(--color-green) font-medium'
                : 'text-(--color-yellow)'
            }
          >
            {selectedGraduation?.isGraduated ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        key: '__graduation_president__',
        label: 'Presidente del Comité',
        render: () => selectedGraduation?.president || '—',
      },
      {
        key: '__graduation_secretary__',
        label: 'Secretario del Comité',
        render: () => selectedGraduation?.secretary || '—',
      },
      {
        key: '__graduation_vocal__',
        label: 'Vocal del Comité',
        render: () => selectedGraduation?.vocal || '—',
      },
      {
        key: '__graduation_substituteVocal__',
        label: 'Vocal Suplente del Comité',
        render: () => selectedGraduation?.substituteVocal || '—',
      },
      {
        key: '__graduation_notes__',
        label: 'Notas',
        render: () => selectedGraduation?.notes || '—',
        fullWidth: true,
      }
    );

    return fields;
  }, [
    getGenerationName,
    getCareerName,
    getStatusLabel,
    getGraduationOptionName,
    selectedCapturedFields,
    selectedGraduation,
  ]);

  // Configuración de filtros
  const filterConfigs: FilterConfig[] = [
    {
      columnKey: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: StudentStatus.ACTIVO, label: 'Activo' },
        { value: StudentStatus.PAUSADO, label: 'Pausado' },
        { value: StudentStatus.CANCELADO, label: 'Cancelado' },
      ],
    },
    {
      columnKey: 'isEgressed',
      label: 'Egresado',
      type: 'toggle',
    },
    {
      columnKey: 'generationId',
      label: 'Generación',
      type: 'select',
      options: generations.map((g) => ({
        value: g.id,
        label: g.name || g.id,
      })),
    },
    {
      columnKey: 'careerId',
      label: 'Carrera',
      type: 'select',
      options: careers.map((c) => ({
        value: c.id,
        label: c.name || c.id,
      })),
    },
  ];

  // Manejar cambios de filtros
  const handleFilterChange = useCallback(
    (columnKey: string, value: string | string[] | boolean) => {
      setFilters((prev) => {
        const updated = { ...prev, [columnKey]: value };

        // Eliminar el filtro si es vacío, false o array vacío
        if (Array.isArray(value) && value.length === 0) {
          delete updated[columnKey];
        } else if (value === '' || value === false) {
          delete updated[columnKey];
        }

        // Si se cambia un filtro de status, eliminar el filtro especial de in-progress
        if (columnKey === 'status' && updated.statusInProgress) {
          delete updated.statusInProgress;
        }

        return updated;
      });
      setPage(1);
    },
    []
  );

  // Resetear filtros
  const handleResetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  // Mapear StudentStatus a claves para createStatusActions
  const getStatusKey = useCallback((status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ACTIVO:
        return 'active';
      case StudentStatus.PAUSADO:
        return 'paused';
      case StudentStatus.CANCELADO:
        return 'cancelled';
      default:
        return 'active';
    }
  }, []);

  // Acciones de fila usando createStatusActions
  const getRowActions = useCallback(
    (student: Student): DropdownMenuItem[] => {
      // Definir transiciones de estado según las reglas del handler
      const transitions: any = {
        active: {
          additionalActions: [
            { label: 'Editar', onClick: () => handleOpenEdit(student) },
            {
              label: 'Eliminar',
              onClick: () => handleDelete(student),
              variant: 'danger' as const,
            },
          ],
          actions: [
            {
              label: 'Pausar',
              targetStatus: 'paused',
              onClick: () => handleStatusChange(student, StudentStatus.PAUSADO),
            },
            {
              label: 'Cancelar',
              targetStatus: 'cancelled',
              onClick: () =>
                handleStatusChange(student, StudentStatus.CANCELADO),
              variant: 'danger' as const,
            },
          ],
          showSeparator: true,
        },
        paused: {
          additionalActions: [
            { label: 'Editar', onClick: () => handleOpenEdit(student) },
            {
              label: 'Eliminar',
              onClick: () => handleDelete(student),
              variant: 'danger' as const,
            },
          ],
          actions: [
            {
              label: 'Activar',
              targetStatus: 'active',
              onClick: () => handleStatusChange(student, StudentStatus.ACTIVO),
            },
          ],
          showSeparator: true,
        },
        cancelled: {
          additionalActions: [
            { label: 'Editar', onClick: () => handleOpenEdit(student) },
            {
              label: 'Eliminar',
              onClick: () => handleDelete(student),
              variant: 'danger' as const,
            },
          ],
          actions: [], // Cancelado no puede cambiar de estado
        },
      };

      const statusActions = createStatusActions(student, {
        currentStatus: getStatusKey(student.status),
        getStatus: (row) => getStatusKey(row.status),
        transitions,
      });

      // Agregar "Ver detalles" al inicio del menú
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(student),
        },
        { separator: true, label: 'separator', onClick: () => {} },
        ...statusActions,
      ];
    },
    [
      handleOpenDetail,
      handleOpenEdit,
      handleDelete,
      handleStatusChange,
      getStatusKey,
    ]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para PageHeader */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Alumnos"
          searchPlaceholder="Buscar por nombre, número de control o email..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          primaryAction={{
            label: 'Añadir',
            onClick: () => setIsCreateModalOpen(true),
          }}
          filters={{
            label: 'Filtros',
            onClick: () => setIsFiltersOpen(!isFiltersOpen),
            isActive: hasActiveFilters,
            buttonRef: filterButtonRef,
          }}
        />

        {/* FilterDropdown */}
        <FilterDropdown
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          triggerRef={filterButtonRef}
          filterConfigs={filterConfigs}
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Contenedor para Table y Paginación */}
      <div className="flex flex-col gap-6 rounded-lg p-6 bg-(--color-component-bg)">
        {listError && (
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error-typo)',
            }}
          >
            <div className="flex items-center justify-between">
              <span>{listError}</span>
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  clearListErrors();
                  showToast({
                    type: 'info',
                    title: 'Error limpiado',
                    message: 'El mensaje de error se ha ocultado',
                  });
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {isLoadingList ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredStudents}
            controlledSortColumn={sortBy}
            controlledSortDirection={sortOrder}
            onSort={handleSort}
            rowActions={getRowActions}
            onRowClick={handleOpenDetail}
            className="border-0 bg-transparent"
          />
        )}

        {/* Paginación */}
        {((manualPagination && manualPagination.totalPages > 1) ||
          (pagination && pagination.totalPages > 1)) && (
          <Pagination
            page={
              manualPagination ? manualPagination.page : pagination?.page || 1
            }
            totalPages={
              manualPagination
                ? manualPagination.totalPages
                : pagination?.totalPages || 1
            }
            hasPrevPage={
              manualPagination
                ? manualPagination.hasPrevPage
                : pagination?.hasPrevPage || false
            }
            hasNextPage={
              manualPagination
                ? manualPagination.hasNextPage
                : pagination?.hasNextPage || false
            }
            prevPage={
              manualPagination
                ? manualPagination.prevPage
                : pagination?.prevPage || null
            }
            nextPage={
              manualPagination
                ? manualPagination.nextPage
                : pagination?.nextPage || null
            }
            onPageChange={(newPage) => {
              if (!isLoadingList) {
                setPage(newPage);
              }
            }}
          />
        )}
      </div>

      {/* Modal de creación */}
      <StudentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedStudent && (
        <StudentForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedStudent}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles del Estudiante"
        data={selectedStudent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
          setSelectedCapturedFields(null);
          setSelectedGraduation(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
