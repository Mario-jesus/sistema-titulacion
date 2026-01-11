import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import {
  Table,
  useToast,
  FilterDropdown,
  Pagination,
  DetailModal,
} from '@shared/ui';
import type {
  FilterConfig,
  TableColumn,
  DropdownMenuItem,
  DetailField,
} from '@shared/ui';
import { useStudents } from '../../lib/useStudents';
import { useGraduations } from '@features/graduations';
import { StudentForm } from '../StudentForm/StudentForm';
import { studentsService } from '../../api/studentsService';
import type {
  ScheduledStudent,
  ListScheduledStudentsParams,
} from '../../model/types';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';
import { loadGraduationOptions } from '@features/graduations/api/graduationOptionsHelper';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import type { GraduationOption } from '@entities/graduation-option';
import type { Student } from '@entities/student';
import { StudentStatus } from '@entities/student';

/**
 * Componente para listar estudiantes programados para titulación
 */
export function StudentsScheduledList() {
  const { showToast } = useToast();
  const {
    scheduledStudents,
    scheduledPagination,
    isLoadingScheduled,
    scheduledError,
    listScheduledStudents,
    clearScheduledErrors,
    getStudentById,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
  } = useStudents();
  const { graduateStudent } = useGraduations();

  // Estados para relaciones
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [graduationOptions, setGraduationOptions] = useState<
    GraduationOption[]
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScheduledStudent, setSelectedScheduledStudent] =
    useState<ScheduledStudent | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Cargar generaciones y carreras al montar
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

    loadGraduationOptions(false) // Cargar todas las opciones (activas e inactivas) para mostrar nombres históricos
      .then((data) => {
        setGraduationOptions(data);
      })
      .catch((error) => {
        console.error('Error al cargar opciones de graduación:', error);
      });
  }, []);

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

  // Cargar estudiantes programados
  const loadStudents = useCallback(async () => {
    const params: ListScheduledStudentsParams = {
      page,
      limit: 10,
      search: searchTerm || undefined,
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      ...(filters.careerId ? { careerId: filters.careerId as string } : {}),
      ...(filters.generationId
        ? { generationId: filters.generationId as string }
        : {}),
      ...(filters.sex ? { sex: filters.sex as string } : {}),
    };

    const result = await listScheduledStudents(params);

    if (!result.success) {
      console.error('Error al cargar estudiantes programados:', result.error);
      showToast({
        type: 'error',
        title: 'Error al cargar estudiantes',
        message: result.error,
      });
    }
  }, [
    page,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    listScheduledStudents,
    showToast,
  ]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Obtener estudiante completo por controlNumber
  const fetchStudentByControlNumber = useCallback(
    async (controlNumber: string): Promise<Student | null> => {
      try {
        // Buscar estudiante por controlNumber usando el endpoint de búsqueda
        const response = await studentsService.list({
          search: controlNumber,
          limit: 1,
        });

        // Buscar el estudiante que coincida exactamente con el controlNumber
        const student = response.data.find(
          (s) => s.controlNumber === controlNumber
        );

        if (student) {
          // Obtener el estudiante completo por ID para asegurar que tenemos todos los datos
          const fullStudent = await getStudentById(student.id);
          return fullStudent.success ? fullStudent.data : null;
        }

        return null;
      } catch (error) {
        console.error('Error al buscar estudiante por controlNumber:', error);
        return null;
      }
    },
    [getStudentById]
  );

  // Abrir modal de detalles
  const handleOpenDetail = useCallback(
    async (scheduledStudent: ScheduledStudent) => {
      setSelectedScheduledStudent(scheduledStudent);
      setIsDetailModalOpen(true);

      try {
        const student = await fetchStudentByControlNumber(
          scheduledStudent.controlNumber
        );
        setSelectedStudent(student);
      } catch (error) {
        console.error('Error al cargar estudiante:', error);
        setSelectedStudent(null);
      }
    },
    [fetchStudentByControlNumber]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback(
    async (scheduledStudent: ScheduledStudent) => {
      try {
        const student = await fetchStudentByControlNumber(
          scheduledStudent.controlNumber
        );

        if (!student) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'No se pudo encontrar el estudiante',
          });
          return;
        }

        setSelectedStudent(student);
        setIsEditModalOpen(true);
      } catch (error) {
        console.error('Error al cargar estudiante para edición:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo cargar el estudiante para edición',
        });
      }
    },
    [fetchStudentByControlNumber, showToast]
  );

  // Manejar edición
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedStudent) return;

      const result = await updateStudent(selectedStudent.id, data);

      if (!result.success) {
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

      setIsEditModalOpen(false);
      setSelectedStudent(null);
      loadStudents();
    },
    [selectedStudent, updateStudent, showToast, loadStudents]
  );

  // Manejar eliminación
  const handleDelete = useCallback(
    async (scheduledStudent: ScheduledStudent) => {
      const fullName = scheduledStudent.fullName;
      if (
        !window.confirm(
          `¿Estás seguro de eliminar al estudiante "${fullName}" (${scheduledStudent.controlNumber})?`
        )
      ) {
        return;
      }

      try {
        const student = await fetchStudentByControlNumber(
          scheduledStudent.controlNumber
        );

        if (!student) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'No se pudo encontrar el estudiante',
          });
          return;
        }

        const result = await deleteStudent(student.id);

        if (!result.success) {
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
          message: `El estudiante "${fullName}" ha sido eliminado exitosamente`,
        });

        loadStudents();
      } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el estudiante',
        });
      }
    },
    [fetchStudentByControlNumber, deleteStudent, showToast, loadStudents]
  );

  // Manejar cambio de status
  const handleStatusChange = useCallback(
    async (scheduledStudent: ScheduledStudent, newStatus: StudentStatus) => {
      const fullName = scheduledStudent.fullName;
      const statusLabel =
        newStatus === StudentStatus.PAUSADO
          ? 'pausar'
          : newStatus === StudentStatus.CANCELADO
          ? 'cancelar'
          : 'activar';

      if (
        !window.confirm(
          `¿Estás seguro de ${statusLabel} al estudiante "${fullName}" (${scheduledStudent.controlNumber})?`
        )
      ) {
        return;
      }

      try {
        const student = await fetchStudentByControlNumber(
          scheduledStudent.controlNumber
        );

        if (!student) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'No se pudo encontrar el estudiante',
          });
          return;
        }

        const result = await changeStudentStatus(student.id, newStatus);

        if (!result.success) {
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
          message: `El estudiante "${fullName}" ha sido ${statusLabel}do exitosamente`,
        });

        loadStudents();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo cambiar el estado del estudiante',
        });
      }
    },
    [fetchStudentByControlNumber, changeStudentStatus, showToast, loadStudents]
  );

  // Manejar marcar como titulado
  const handleGraduate = useCallback(
    async (scheduledStudent: ScheduledStudent) => {
      const fullName = scheduledStudent.fullName;
      if (
        !window.confirm(
          `¿Estás seguro de marcar como titulado al estudiante "${fullName}" (${scheduledStudent.controlNumber})?`
        )
      ) {
        return;
      }

      try {
        const student = await fetchStudentByControlNumber(
          scheduledStudent.controlNumber
        );

        if (!student) {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'No se pudo encontrar el estudiante',
          });
          return;
        }

        const result = await graduateStudent(student.id);

        if (!result.success) {
          showToast({
            type: 'error',
            title: 'Error al marcar como titulado',
            message: result.error,
          });
          return;
        }

        showToast({
          type: 'success',
          title: 'Estudiante titulado',
          message: `El estudiante "${fullName}" ha sido marcado como titulado exitosamente`,
        });

        loadStudents();
      } catch (error) {
        console.error('Error al marcar como titulado:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo marcar el estudiante como titulado',
        });
      }
    },
    [fetchStudentByControlNumber, graduateStudent, showToast, loadStudents]
  );

  // Mostrar errores
  useEffect(() => {
    if (scheduledError) {
      showToast({
        type: 'error',
        title: 'Error',
        message: scheduledError,
      });
      clearScheduledErrors();
    }
  }, [scheduledError, showToast, clearScheduledErrors]);

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

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

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

  // Configuración de filtros
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        columnKey: 'careerId',
        label: 'Carrera',
        type: 'select',
        options: careers.map((career) => ({
          value: career.id,
          label: career.name || career.id,
        })),
      },
      {
        columnKey: 'generationId',
        label: 'Generación',
        type: 'select',
        options: generations.map((generation) => ({
          value: generation.id,
          label: generation.name || generation.id,
        })),
      },
      {
        columnKey: 'sex',
        label: 'Sexo',
        type: 'select',
        options: [
          { value: 'MASCULINO', label: 'Masculino' },
          { value: 'FEMENINO', label: 'Femenino' },
        ],
      },
    ],
    [careers, generations]
  );

  // Formatear fecha de graduación programada
  const formatGraduationDate = useCallback((dateString: string | null) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<ScheduledStudent>[] = useMemo(
    () => [
      {
        key: 'controlNumber',
        label: 'Número de Control',
        sortable: true,
      },
      {
        key: 'fullName',
        label: 'Nombre Completo',
        sortable: true,
      },
      {
        key: 'sex',
        label: 'Sexo',
        render: (value: string) => {
          return value === 'MASCULINO' ? 'Masculino' : 'Femenino';
        },
      },
      {
        key: 'careerId',
        label: 'Carrera',
        render: (value: string) => getCareerName(value),
      },
      {
        key: 'graduationOptionId',
        label: 'Opción de Titulación',
        render: (value: string | null) => getGraduationOptionName(value),
      },
      {
        key: 'graduationDate',
        label: 'Fecha Programada',
        sortable: true,
        render: (value: string | null) => formatGraduationDate(value),
      },
      {
        key: 'isGraduated',
        label: 'Estado',
        render: (value: boolean) => {
          return value ? (
            <span style={{ color: 'var(--color-success-typo)' }}>Titulado</span>
          ) : (
            <span style={{ color: 'var(--color-warning-typo)' }}>
              Pendiente
            </span>
          );
        },
      },
    ],
    [getCareerName, formatGraduationDate, getGraduationOptionName]
  );

  // Acciones de fila
  const getRowActions = useCallback(
    (scheduledStudent: ScheduledStudent): DropdownMenuItem[] => {
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(scheduledStudent),
        },
        { separator: true, label: 'separator', onClick: () => {} },
        {
          label: 'Editar',
          onClick: () => handleOpenEdit(scheduledStudent),
        },
        {
          label: 'Eliminar',
          onClick: () => handleDelete(scheduledStudent),
          variant: 'danger' as const,
        },
        { separator: true, label: 'separator2', onClick: () => {} },
        {
          label: 'Pausar',
          onClick: () =>
            handleStatusChange(scheduledStudent, StudentStatus.PAUSADO),
        },
        { separator: true, label: 'separator3', onClick: () => {} },
        {
          label: 'Marcar como titulado',
          onClick: () => handleGraduate(scheduledStudent),
        },
      ];
    },
    [
      handleOpenDetail,
      handleOpenEdit,
      handleDelete,
      handleStatusChange,
      handleGraduate,
    ]
  );

  // Campos para el modal de detalles
  const detailFields: DetailField<ScheduledStudent>[] = useMemo(
    () => [
      {
        key: 'controlNumber',
        label: 'Número de Control',
      },
      {
        key: 'fullName',
        label: 'Nombre Completo',
      },
      {
        key: 'sex',
        label: 'Sexo',
        render: (value: string) =>
          value === 'MASCULINO' ? 'Masculino' : 'Femenino',
      },
      {
        key: 'careerId',
        label: 'Carrera',
        render: (value: string) => getCareerName(value),
      },
      {
        key: 'graduationOptionId',
        label: 'Opción de Titulación',
        render: (value: string | null) => getGraduationOptionName(value),
      },
      {
        key: 'graduationDate',
        label: 'Fecha Programada',
        render: (value: string | null) => formatGraduationDate(value),
      },
      {
        key: 'isGraduated',
        label: 'Estado',
        render: (value: boolean) => {
          return value ? (
            <span style={{ color: 'var(--color-success-typo)' }}>Titulado</span>
          ) : (
            <span style={{ color: 'var(--color-warning-typo)' }}>
              Pendiente
            </span>
          );
        },
      },
    ],
    [getCareerName, getGraduationOptionName, formatGraduationDate]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para PageHeader */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Estudiantes Programados"
          searchPlaceholder="Buscar por nombre o número de control..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
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
        {isLoadingScheduled ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={scheduledStudents}
            controlledSortColumn={sortBy}
            controlledSortDirection={sortOrder}
            onSort={handleSort}
            onRowClick={handleOpenDetail}
            rowActions={getRowActions}
            className="border-0 bg-transparent"
          />
        )}

        {/* Paginación */}
        {scheduledPagination && scheduledPagination.totalPages > 1 && (
          <Pagination
            page={scheduledPagination.page}
            totalPages={scheduledPagination.totalPages}
            hasPrevPage={scheduledPagination.hasPrevPage}
            hasNextPage={scheduledPagination.hasNextPage}
            prevPage={scheduledPagination.prevPage}
            nextPage={scheduledPagination.nextPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles del Estudiante Programado"
        data={selectedScheduledStudent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedScheduledStudent(null);
          setSelectedStudent(null);
        }}
        fields={detailFields}
        maxWidth="lg"
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
    </div>
  );
}
