import { useEffect, useState, useCallback, useRef } from 'react';
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
import { useGraduationOptions } from '../../lib/useGraduationOptions';
import { GraduationOptionForm } from '../GraduationOptionForm/GraduationOptionForm';
import type { GraduationOption } from '@entities/graduation-option';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar y gestionar opciones de titulación
 * Contiene toda la lógica de negocio y UI para la gestión de opciones de titulación
 */
export function GraduationOptionsList() {
  const { showToast } = useToast();
  const {
    graduationOptions,
    pagination,
    isLoadingList,
    listError,
    listGraduationOptions,
    createGraduationOption,
    updateGraduationOption,
    deleteGraduationOption,
    activateGraduationOption,
    deactivateGraduationOption,
    clearListErrors,
  } = useGraduationOptions();

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
  const [selectedOption, setSelectedOption] =
    useState<GraduationOption | null>(null);

  // Obtener activeOnly de filters
  const activeOnly = filters.activeOnly === true;

  // Cargar opciones de titulación
  const loadGraduationOptions = useCallback(async () => {
    try {
      await listGraduationOptions({
        page,
        limit: 10,
        search: searchTerm || undefined,
        activeOnly: activeOnly || undefined,
        // Solo incluir sortBy y sortOrder si ambos están definidos
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      });
    } catch (error) {
      console.error('Error al cargar opciones de titulación:', error);
      showToast({
        type: 'error',
        title: 'Error al cargar opciones de titulación',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las opciones de titulación',
      });
    }
  }, [
    page,
    searchTerm,
    activeOnly,
    sortBy,
    sortOrder,
    listGraduationOptions,
    showToast,
  ]);

  useEffect(() => {
    loadGraduationOptions();
  }, [loadGraduationOptions]);

  // Manejar búsqueda
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setPage(1);
    },
    []
  );

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
        await createGraduationOption(data);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Opción de titulación creada',
          message: 'La opción de titulación se ha creado exitosamente',
        });
        loadGraduationOptions();
      } catch (error) {
        console.error('Error al crear opción de titulación:', error);
        showToast({
          type: 'error',
          title: 'Error al crear opción de titulación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo crear la opción de titulación',
        });
        throw error;
      }
    },
    [createGraduationOption, loadGraduationOptions, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedOption) return;
      try {
        await updateGraduationOption(selectedOption.id, data);
        setIsEditModalOpen(false);
        setSelectedOption(null);
        showToast({
          type: 'success',
          title: 'Opción de titulación actualizada',
          message: 'La opción de titulación se ha actualizado exitosamente',
        });
        loadGraduationOptions();
      } catch (error) {
        console.error('Error al actualizar opción de titulación:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar opción de titulación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar la opción de titulación',
        });
        throw error;
      }
    },
    [selectedOption, updateGraduationOption, loadGraduationOptions, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (option: GraduationOption) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar la opción de titulación "${option.name}"?`
        )
      ) {
        return;
      }
      try {
        await deleteGraduationOption(option.id);
        showToast({
          type: 'success',
          title: 'Opción de titulación eliminada',
          message: `La opción de titulación "${option.name}" se ha eliminado exitosamente`,
        });
        loadGraduationOptions();
      } catch (error) {
        console.error('Error al eliminar opción de titulación:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar opción de titulación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar la opción de titulación',
        });
      }
    },
    [deleteGraduationOption, loadGraduationOptions, showToast]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (option: GraduationOption) => {
      try {
        if (option.isActive) {
          await deactivateGraduationOption(option.id);
          showToast({
            type: 'success',
            title: 'Opción de titulación desactivada',
            message: `La opción de titulación "${option.name}" se ha desactivado exitosamente`,
          });
        } else {
          await activateGraduationOption(option.id);
          showToast({
            type: 'success',
            title: 'Opción de titulación activada',
            message: `La opción de titulación "${option.name}" se ha activado exitosamente`,
          });
        }
        loadGraduationOptions();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado de la opción de titulación',
        });
      }
    },
    [
      activateGraduationOption,
      deactivateGraduationOption,
      loadGraduationOptions,
      showToast,
    ]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((option: GraduationOption) => {
    setSelectedOption(option);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((option: GraduationOption) => {
    setSelectedOption(option);
    setIsDetailModalOpen(true);
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<GraduationOption>[] = [
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
  const detailFields: DetailField<GraduationOption>[] = [
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
    (option: GraduationOption): DropdownMenuItem[] => {
      // Obtener acciones basadas en el estado usando createStatusActions
      const statusActions = createStatusActions(option, {
        currentStatus: option.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(option) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(option),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(option),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(option) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(option),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(option),
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
          onClick: () => handleOpenDetail(option),
        },
        { separator: true, label: 'separator' },
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
          title="Opciones de Titulación"
          searchPlaceholder="Buscar opción de titulación..."
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
            <div
              className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin"
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={graduationOptions}
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
      <GraduationOptionForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedOption && (
        <GraduationOptionForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOption(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedOption}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles de la Opción de Titulación"
        data={selectedOption}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOption(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
