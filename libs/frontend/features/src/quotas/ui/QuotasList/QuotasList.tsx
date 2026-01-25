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
import { useQuotas } from '../../lib/useQuotas';
import { QuotaForm } from '../QuotaForm/QuotaForm';
import { loadGenerations } from '../../api/generationsHelper';
import { loadCareers } from '../../api/careersHelper';
import type { Quota } from '@entities/quota';
import type { Generation } from '@entities/generation';
import type { Career } from '@entities/career';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar y gestionar cupos
 * Contiene toda la lógica de negocio y UI para la gestión de cupos
 */
export function QuotasList() {
  const { showToast } = useToast();
  const {
    quotas,
    pagination,
    isLoadingList,
    listQuotas,
    createQuota,
    updateQuota,
    deleteQuota,
    activateQuota,
    deactivateQuota,
  } = useQuotas();

  // Estados para relaciones
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);

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
  const [selectedQuota, setSelectedQuota] = useState<Quota | null>(null);

  // Obtener activeOnly de filters
  const activeOnly = filters.activeOnly === true;

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

  // Cargar cupos
  const loadQuotas = useCallback(async () => {
    const result = await listQuotas({
      page,
      limit: 10,
      search: searchTerm || undefined,
      activeOnly: activeOnly || undefined,
      // Solo incluir sortBy y sortOrder si ambos están definidos
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    });

    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Error al cargar cupos',
        message: result.error || 'No se pudieron cargar los cupos',
      });
    }
  }, [page, searchTerm, activeOnly, sortBy, sortOrder, listQuotas, showToast]);

  useEffect(() => {
    loadQuotas();
  }, [loadQuotas]);

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
      try {
        await createQuota(data);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Cupo creado',
          message: 'El cupo se ha creado exitosamente',
        });
        loadQuotas();
      } catch (error) {
        console.error('Error al crear cupo:', error);
        showToast({
          type: 'error',
          title: 'Error al crear cupo',
          message:
            error instanceof Error ? error.message : 'No se pudo crear el cupo',
        });
        throw error;
      }
    },
    [createQuota, loadQuotas, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedQuota) return;
      try {
        await updateQuota(selectedQuota.id, data);
        setIsEditModalOpen(false);
        setSelectedQuota(null);
        showToast({
          type: 'success',
          title: 'Cupo actualizado',
          message: 'El cupo se ha actualizado exitosamente',
        });
        loadQuotas();
      } catch (error) {
        console.error('Error al actualizar cupo:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar cupo',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar el cupo',
        });
        throw error;
      }
    },
    [selectedQuota, updateQuota, loadQuotas, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (quota: Quota) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar el cupo de ${getCareerName(
            quota.careerId
          )} - ${getGenerationName(quota.generationId)}?`
        )
      ) {
        return;
      }
      try {
        await deleteQuota(quota.id);
        showToast({
          type: 'success',
          title: 'Cupo eliminado',
          message: 'El cupo se ha eliminado exitosamente',
        });
        loadQuotas();
      } catch (error) {
        console.error('Error al eliminar cupo:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar cupo',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar el cupo',
        });
      }
    },
    [deleteQuota, loadQuotas, showToast, getCareerName, getGenerationName]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (quota: Quota) => {
      try {
        if (quota.isActive) {
          await deactivateQuota(quota.id);
          showToast({
            type: 'success',
            title: 'Cupo desactivado',
            message: 'El cupo se ha desactivado exitosamente',
          });
        } else {
          await activateQuota(quota.id);
          showToast({
            type: 'success',
            title: 'Cupo activado',
            message: 'El cupo se ha activado exitosamente',
          });
        }
        loadQuotas();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado del cupo',
        });
      }
    },
    [activateQuota, deactivateQuota, loadQuotas, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((quota: Quota) => {
    setSelectedQuota(quota);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((quota: Quota) => {
    setSelectedQuota(quota);
    setIsDetailModalOpen(true);
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<Quota>[] = [
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
      key: 'newAdmissionQuotasMale',
      label: 'Cupos Hombres',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'newAdmissionQuotasFemale',
      label: 'Cupos Mujeres',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'total',
      label: 'Total Cupos',
      sortable: false,
      render: (_value: unknown, quota: Quota) =>
        (
          quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale
        ).toLocaleString(),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string | null) => value || '-',
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<Quota>[] = [
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
      key: 'newAdmissionQuotasMale',
      label: 'Cupos para Hombres',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'newAdmissionQuotasFemale',
      label: 'Cupos para Mujeres',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'total',
      label: 'Total de Cupos',
      render: (_value: unknown, quota: Quota) =>
        (
          quota.newAdmissionQuotasMale + quota.newAdmissionQuotasFemale
        ).toLocaleString(),
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

  // Configuración de filtros
  const filterConfigs: FilterConfig[] = [
    {
      columnKey: 'activeOnly',
      label: 'Solo activos',
      type: 'toggle',
    },
  ];

  // Manejar cambios de filtros
  const handleFilterChange = useCallback(
    (columnKey: string, value: string | string[] | boolean) => {
      setFilters((prev) => {
        const updated = { ...prev, [columnKey]: value };

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

  // Acciones de fila usando createStatusActions
  const getRowActions = useCallback(
    (quota: Quota): DropdownMenuItem[] => {
      const statusActions = createStatusActions(quota, {
        currentStatus: quota.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(quota) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(quota),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(quota),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(quota) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(quota),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(quota),
              },
            ],
            showSeparator: true,
          },
        },
      });

      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(quota),
        },
        { separator: true, label: 'separator', onClick: () => {} },
        ...statusActions,
      ];
    },
    [handleOpenDetail, handleOpenEdit, handleToggleActive, handleDelete]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para PageHeader */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Cupos"
          searchPlaceholder="Buscar cupo..."
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
        {isLoadingList ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={quotas}
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

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={pagination.hasNextPage}
            prevPage={pagination.prevPage}
            nextPage={pagination.nextPage}
            onPageChange={(newPage) => {
              if (!isLoadingList) {
                setPage(newPage);
              }
            }}
          />
        )}
      </div>

      {/* Modal de creación */}
      <QuotaForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedQuota && (
        <QuotaForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedQuota(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedQuota}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles del Cupo"
        data={selectedQuota}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQuota(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
