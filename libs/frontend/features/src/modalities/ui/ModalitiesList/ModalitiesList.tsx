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
import { useModalities } from '../../lib/useModalities';
import { ModalityForm } from '../ModalityForm/ModalityForm';
import type { Modality } from '@entities/modality';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar y gestionar modalidades
 * Contiene toda la lógica de negocio y UI para la gestión de modalidades
 */
export function ModalitiesList() {
  const { showToast } = useToast();
  const {
    modalities,
    pagination,
    isLoadingList,
    listModalities,
    createModality,
    updateModality,
    deleteModality,
    activateModality,
    deactivateModality,
  } = useModalities();

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
  const [selectedModality, setSelectedModality] = useState<Modality | null>(
    null
  );

  // Obtener activeOnly de filters
  const activeOnly = filters.activeOnly === true;

  // Cargar modalidades
  const loadModalities = useCallback(async () => {
    const result = await listModalities({
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
        title: 'Error al cargar modalidades',
        message: result.error || 'No se pudieron cargar las modalidades',
      });
    }
  }, [
    page,
    searchTerm,
    activeOnly,
    sortBy,
    sortOrder,
    listModalities,
    showToast,
  ]);

  useEffect(() => {
    loadModalities();
  }, [loadModalities]);

  // Manejar búsqueda
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Manejar ordenamiento
  const handleSort = useCallback(
    (columnKey: string, direction: 'asc' | 'desc' | null) => {
      if (direction === null) {
        // Si la dirección es null, resetear el ordenamiento
        setSortBy(null);
        setSortOrder(null);
      } else {
        // Si hay dirección, establecer ambos valores
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
        await createModality(data);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Modalidad creada',
          message: 'La modalidad se ha creado exitosamente',
        });
        loadModalities();
      } catch (error) {
        console.error('Error al crear modalidad:', error);
        showToast({
          type: 'error',
          title: 'Error al crear modalidad',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo crear la modalidad',
        });
        throw error;
      }
    },
    [createModality, loadModalities, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedModality) return;
      try {
        await updateModality(selectedModality.id, data);
        setIsEditModalOpen(false);
        setSelectedModality(null);
        showToast({
          type: 'success',
          title: 'Modalidad actualizada',
          message: 'La modalidad se ha actualizado exitosamente',
        });
        loadModalities();
      } catch (error) {
        console.error('Error al actualizar modalidad:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar modalidad',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar la modalidad',
        });
        throw error;
      }
    },
    [selectedModality, updateModality, loadModalities, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (modality: Modality) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar la modalidad "${modality.name}"?`
        )
      ) {
        return;
      }
      try {
        await deleteModality(modality.id);
        showToast({
          type: 'success',
          title: 'Modalidad eliminada',
          message: `La modalidad "${modality.name}" se ha eliminado exitosamente`,
        });
        loadModalities();
      } catch (error) {
        console.error('Error al eliminar modalidad:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar modalidad',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar la modalidad',
        });
      }
    },
    [deleteModality, loadModalities, showToast]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (modality: Modality) => {
      try {
        if (modality.isActive) {
          await deactivateModality(modality.id);
          showToast({
            type: 'success',
            title: 'Modalidad desactivada',
            message: `La modalidad "${modality.name}" se ha desactivado exitosamente`,
          });
        } else {
          await activateModality(modality.id);
          showToast({
            type: 'success',
            title: 'Modalidad activada',
            message: `La modalidad "${modality.name}" se ha activado exitosamente`,
          });
        }
        loadModalities();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado de la modalidad',
        });
      }
    },
    [activateModality, deactivateModality, loadModalities, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((modality: Modality) => {
    setSelectedModality(modality);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((modality: Modality) => {
    setSelectedModality(modality);
    setIsDetailModalOpen(true);
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<Modality>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string | null) => value || '-',
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<Modality>[] = [
    { key: 'name', label: 'Nombre' },
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
          {value ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
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
        // Manejar tanto Date como string ISO
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
      label: 'Solo activas',
      type: 'toggle',
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

        return updated;
      });
      setPage(1); // Resetear a primera página al cambiar filtros
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
    (modality: Modality): DropdownMenuItem[] => {
      // Obtener acciones basadas en el estado usando createStatusActions
      const statusActions = createStatusActions(modality, {
        currentStatus: modality.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(modality) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(modality),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(modality),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(modality) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(modality),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(modality),
              },
            ],
            showSeparator: true,
          },
        },
      });

      // Agregar "Ver detalles" al inicio del menú, seguido de un separador
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(modality),
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
          title="Modalidades"
          searchPlaceholder="Buscar modalidad..."
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
            data={modalities}
            statusColumn={{
              key: 'isActive',
              getStatus: (row) => ({
                status: row.isActive ? 'active' : 'inactive',
                label: row.isActive ? 'Activa' : 'Inactiva',
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
      <ModalityForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedModality && (
        <ModalityForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedModality(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedModality}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles de la Modalidad"
        data={selectedModality}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedModality(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
