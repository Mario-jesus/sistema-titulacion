import { useEffect, useState, useCallback, useRef } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import {
  Table,
  useToast,
  FilterDropdown,
  createStatusActions,
  Pagination,
} from '@shared/ui';
import { DetailModal } from '@shared/ui';
import type { DropdownMenuItem, FilterConfig } from '@shared/ui';
import { exportTable } from '@shared/lib/excel';
import { useAuth } from '@features/auth';
import { UserRole } from '@entities/user';
import { useNewAdmissions } from '../../lib/useNewAdmissions';
import { newAdmissionsService } from '../../api/newAdmissionsService';
import { NewAdmissionForm } from '../NewAdmissionForm/NewAdmissionForm';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';
import type { NewAdmission } from '@entities/new-admission';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import type { TableColumn, DetailField } from '@shared/ui';
import type {
  CreateNewAdmissionRequest,
  UpdateNewAdmissionRequest,
} from '../../model/types';

/**
 * Componente para listar y gestionar registros de nuevo ingreso
 */
export function NewAdmissionsList() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === UserRole.STAFF;
  const {
    newAdmissions,
    pagination,
    isLoadingList,
    listNewAdmissions,
    createNewAdmission,
    updateNewAdmission,
    deleteNewAdmission,
    activateNewAdmission,
    deactivateNewAdmission,
  } = useNewAdmissions();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [filters, setFilters] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNewAdmission, setSelectedNewAdmission] =
    useState<NewAdmission | null>(null);

  const activeOnly = filters.activeOnly === true;

  useEffect(() => {
    loadGenerations({ activeOnly: false })
      .then((data) => setGenerations(data))
      .catch((error) => console.error('Error al cargar generaciones:', error));
    loadCareers()
      .then((data) => setCareers(data))
      .catch((error) => console.error('Error al cargar carreras:', error));
  }, []);

  const getGenerationName = useCallback(
    (generationId: string) =>
      generations.find((g) => g.id === generationId)?.name || generationId,
    [generations]
  );

  const getCareerName = useCallback(
    (careerId: string) =>
      careers.find((c) => c.id === careerId)?.name || careerId,
    [careers]
  );

  const loadNewAdmissions = useCallback(async () => {
    const result = await listNewAdmissions({
      page,
      limit: 10,
      search: searchTerm || undefined,
      activeOnly: activeOnly || undefined,
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    });

    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Error al cargar registros de ingreso',
        message:
          result.error || 'No se pudieron cargar los registros de ingreso',
      });
    }
  }, [
    page,
    searchTerm,
    activeOnly,
    sortBy,
    sortOrder,
    listNewAdmissions,
    showToast,
  ]);

  useEffect(() => {
    loadNewAdmissions();
  }, [loadNewAdmissions]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

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

  const handleCreate = useCallback(
    async (data: CreateNewAdmissionRequest | UpdateNewAdmissionRequest) => {
      try {
        await createNewAdmission(data as CreateNewAdmissionRequest);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Registro creado',
          message: 'El registro se ha creado exitosamente',
        });
        loadNewAdmissions();
      } catch (error) {
        console.error('Error al crear registro:', error);
        showToast({
          type: 'error',
          title: 'Error al crear registro',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo crear el registro',
        });
        throw error;
      }
    },
    [createNewAdmission, loadNewAdmissions, showToast]
  );

  const handleEdit = useCallback(
    async (data: Parameters<typeof updateNewAdmission>[1]) => {
      if (!selectedNewAdmission) return;
      try {
        await updateNewAdmission(selectedNewAdmission.id, data);
        setIsEditModalOpen(false);
        setSelectedNewAdmission(null);
        showToast({
          type: 'success',
          title: 'Registro actualizado',
          message: 'El registro se ha actualizado exitosamente',
        });
        loadNewAdmissions();
      } catch (error) {
        console.error('Error al actualizar registro:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar registro',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar el registro',
        });
        throw error;
      }
    },
    [selectedNewAdmission, updateNewAdmission, loadNewAdmissions, showToast]
  );

  const handleDelete = useCallback(
    async (entry: NewAdmission) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar el registro de ingreso de ${getCareerName(
            entry.careerId
          )} - ${getGenerationName(entry.generationId)}?`
        )
      ) {
        return;
      }
      try {
        await deleteNewAdmission(entry.id);
        showToast({
          type: 'success',
          title: 'Registro eliminado',
          message: 'El registro se ha eliminado exitosamente',
        });
        loadNewAdmissions();
      } catch (error) {
        console.error('Error al eliminar registro:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar registro',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar el registro',
        });
      }
    },
    [
      deleteNewAdmission,
      loadNewAdmissions,
      showToast,
      getCareerName,
      getGenerationName,
    ]
  );

  const handleToggleActive = useCallback(
    async (entry: NewAdmission) => {
      try {
        if (entry.isActive) {
          await deactivateNewAdmission(entry.id);
          showToast({
            type: 'success',
            title: 'Registro desactivado',
            message: 'El registro se ha desactivado exitosamente',
          });
        } else {
          await activateNewAdmission(entry.id);
          showToast({
            type: 'success',
            title: 'Registro activado',
            message: 'El registro se ha activado exitosamente',
          });
        }
        loadNewAdmissions();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado del registro',
        });
      }
    },
    [activateNewAdmission, deactivateNewAdmission, loadNewAdmissions, showToast]
  );

  const handleOpenEdit = useCallback((entry: NewAdmission) => {
    setSelectedNewAdmission(entry);
    setIsEditModalOpen(true);
  }, []);

  const handleOpenDetail = useCallback((entry: NewAdmission) => {
    setSelectedNewAdmission(entry);
    setIsDetailModalOpen(true);
  }, []);

  const columns: TableColumn<NewAdmission>[] = [
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
      key: 'maleCount',
      label: 'Hombres',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'femaleCount',
      label: 'Mujeres',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'total',
      label: 'Total Alumnos',
      sortable: false,
      render: (_value: unknown, entry: NewAdmission) =>
        (entry.maleCount + entry.femaleCount).toLocaleString(),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string | null) => value || '-',
    },
  ];

  const detailFields: DetailField<NewAdmission>[] = [
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
      key: 'maleCount',
      label: 'Alumnos Hombres',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'femaleCount',
      label: 'Alumnas Mujeres',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'total',
      label: 'Total de Alumnos',
      render: (_value: unknown, entry: NewAdmission) =>
        (entry.maleCount + entry.femaleCount).toLocaleString(),
    },
    {
      key: 'description',
      label: 'Descripción',
      fullWidth: true,
      render: (value: string | null) => value || 'Sin descripción',
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value: boolean) => (
        <span
          className={
            value
              ? 'text-(--color-green) font-medium'
              : 'text-(--color-salmon) font-medium'
          }
        >
          {value ? 'Activo' : 'Inactivo'}
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

  const filterConfigs: FilterConfig[] = [
    { columnKey: 'activeOnly', label: 'Solo activos', type: 'toggle' },
  ];

  const handleFilterChange = useCallback(
    (columnKey: string, value: string | string[] | boolean) => {
      setFilters((prev) => {
        const updated = { ...prev, [columnKey]: value };
        if (Array.isArray(value) && value.length === 0)
          delete updated[columnKey];
        else if (value === '' || value === false) delete updated[columnKey];
        return updated;
      });
      setPage(1);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await newAdmissionsService.list({
        limit: 999999,
        search: searchTerm || undefined,
        activeOnly: activeOnly || undefined,
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      });

      const exportColumns: TableColumn<
        NewAdmission & {
          generationName: string;
          careerName: string;
          total: number;
        }
      >[] = [
        { key: 'generationName', label: 'Generación' },
        { key: 'careerName', label: 'Carrera' },
        { key: 'maleCount', label: 'Hombres' },
        { key: 'femaleCount', label: 'Mujeres' },
        { key: 'total', label: 'Total Alumnos' },
        { key: 'description', label: 'Descripción' },
        { key: 'isActive', label: 'Estado' },
      ];

      const exportData = response.data.map((entry) => ({
        ...entry,
        generationName: getGenerationName(entry.generationId),
        careerName: getCareerName(entry.careerId),
        total: entry.maleCount + entry.femaleCount,
        isActive: entry.isActive ? 'Activo' : 'Inactivo',
      }));

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `nuevo-ingreso-${dateStr}`;

      await exportTable({
        filename,
        sheetName: 'Nuevo Ingreso',
        columns: exportColumns,
        data: exportData,
        title: 'Nuevo Ingreso',
      });

      showToast({
        type: 'success',
        title: 'Exportación exitosa',
        message: 'Los registros se han exportado a Excel correctamente',
      });
    } catch (error) {
      console.error('Error al exportar registros:', error);
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo exportar los registros',
      });
    } finally {
      setIsExporting(false);
    }
  }, [
    searchTerm,
    activeOnly,
    sortBy,
    sortOrder,
    getGenerationName,
    getCareerName,
    showToast,
  ]);

  const getRowActions = useCallback(
    (entry: NewAdmission): DropdownMenuItem[] => {
      if (isStaff) {
        return [
          { label: 'Ver detalles', onClick: () => handleOpenDetail(entry) },
        ];
      }
      const statusActions = createStatusActions(entry, {
        currentStatus: entry.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(entry) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(entry),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(entry),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(entry) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(entry),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(entry),
              },
            ],
            showSeparator: true,
          },
        },
      });

      return [
        { label: 'Ver detalles', onClick: () => handleOpenDetail(entry) },
        { separator: true, label: 'separator', onClick: () => {} },
        ...statusActions,
      ];
    },
    [
      isStaff,
      handleOpenDetail,
      handleOpenEdit,
      handleToggleActive,
      handleDelete,
    ]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Nuevo Ingreso"
          searchPlaceholder="Buscar registro..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          primaryAction={
            isStaff
              ? undefined
              : { label: 'Añadir', onClick: () => setIsCreateModalOpen(true) }
          }
          exportAction={
            isStaff
              ? undefined
              : {
                  label: 'Exportar a Excel',
                  onClick: handleExportToExcel,
                  isLoading: isExporting,
                  disabled: isLoadingList || newAdmissions.length === 0,
                }
          }
          filters={{
            label: 'Filtros',
            onClick: () => setIsFiltersOpen(!isFiltersOpen),
            isActive: hasActiveFilters,
            buttonRef: filterButtonRef,
          }}
        />

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

      <div className="flex flex-col gap-6 rounded-lg p-6 bg-(--color-component-bg)">
        {isLoadingList ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={newAdmissions}
            statusColumn={{
              key: 'isActive',
              getStatus: (row) => ({
                status: row.isActive ? 'active' : 'inactive',
                label: row.isActive ? 'Activo' : 'Inactivo',
              }),
            }}
            controlledSortColumn={sortBy}
            controlledSortDirection={sortOrder}
            onSort={handleSort}
            rowActions={getRowActions}
            onRowClick={handleOpenDetail}
            className="border-0 bg-transparent"
          />
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={pagination.hasNextPage}
            prevPage={pagination.prevPage}
            nextPage={pagination.nextPage}
            onPageChange={(newPage) => {
              if (!isLoadingList) setPage(newPage);
            }}
          />
        )}
      </div>

      <NewAdmissionForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {selectedNewAdmission && (
        <NewAdmissionForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedNewAdmission(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedNewAdmission}
        />
      )}

      <DetailModal
        title="Detalles del Registro de Ingreso"
        data={selectedNewAdmission}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNewAdmission(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
