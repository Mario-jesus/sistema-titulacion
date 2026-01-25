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
import { useGenerations } from '../../lib/useGenerations';
import { generationsService } from '../../api/generationsService';
import { GenerationForm } from '../GenerationForm/GenerationForm';
import type { Generation } from '@entities/generation';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar y gestionar generaciones
 * Contiene toda la lógica de negocio y UI para la gestión de generaciones
 */
export function GenerationsList() {
  const { showToast } = useToast();
  const {
    generations,
    pagination,
    isLoadingList,
    listGenerations,
    createGeneration,
    updateGeneration,
    deleteGeneration,
    activateGeneration,
    deactivateGeneration,
  } = useGenerations();

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
  const [selectedGeneration, setSelectedGeneration] =
    useState<Generation | null>(null);

  // Obtener activeOnly de filters
  const activeOnly = filters.activeOnly === true;

  // Cargar generaciones
  const loadGenerations = useCallback(async () => {
    const result = await listGenerations({
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
        title: 'Error al cargar generaciones',
        message: result.error || 'No se pudieron cargar las generaciones',
      });
    }
  }, [
    page,
    searchTerm,
    activeOnly,
    sortBy,
    sortOrder,
    listGenerations,
    showToast,
  ]);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

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
        await createGeneration(data);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Generación creada',
          message: 'La generación se ha creado exitosamente',
        });
        loadGenerations();
      } catch (error) {
        console.error('Error al crear generación:', error);
        showToast({
          type: 'error',
          title: 'Error al crear generación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo crear la generación',
        });
        throw error;
      }
    },
    [createGeneration, loadGenerations, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedGeneration) return;
      try {
        await updateGeneration(selectedGeneration.id, data);
        setIsEditModalOpen(false);
        setSelectedGeneration(null);
        showToast({
          type: 'success',
          title: 'Generación actualizada',
          message: 'La generación se ha actualizado exitosamente',
        });
        loadGenerations();
      } catch (error) {
        console.error('Error al actualizar generación:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar generación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar la generación',
        });
        throw error;
      }
    },
    [selectedGeneration, updateGeneration, loadGenerations, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (generation: Generation) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar la generación "${generation.name}"?`
        )
      ) {
        return;
      }
      try {
        await deleteGeneration(generation.id);
        showToast({
          type: 'success',
          title: 'Generación eliminada',
          message: `La generación "${generation.name}" se ha eliminado exitosamente`,
        });
        loadGenerations();
      } catch (error) {
        console.error('Error al eliminar generación:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar generación',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar la generación',
        });
      }
    },
    [deleteGeneration, loadGenerations, showToast]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (generation: Generation) => {
      try {
        if (generation.isActive) {
          await deactivateGeneration(generation.id);
          showToast({
            type: 'success',
            title: 'Generación desactivada',
            message: `La generación "${generation.name}" se ha desactivado exitosamente`,
          });
        } else {
          await activateGeneration(generation.id);
          showToast({
            type: 'success',
            title: 'Generación activada',
            message: `La generación "${generation.name}" se ha activado exitosamente`,
          });
        }
        loadGenerations();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado de la generación',
        });
      }
    },
    [activateGeneration, deactivateGeneration, loadGenerations, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((generation: Generation) => {
    setSelectedGeneration(generation);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((generation: Generation) => {
    setSelectedGeneration(generation);
    setIsDetailModalOpen(true);
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<Generation>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'startYear',
      label: 'Año Inicio',
      sortable: true,
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.getFullYear().toString();
      },
    },
    {
      key: 'endYear',
      label: 'Año Fin',
      sortable: true,
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.getFullYear().toString();
      },
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string | null) => value || '-',
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<Generation>[] = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'startYear',
      label: 'Año de Inicio',
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.getFullYear().toString();
      },
    },
    {
      key: 'endYear',
      label: 'Año de Fin',
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.getFullYear().toString();
      },
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

  // Estado para exportación
  const [isExporting, setIsExporting] = useState(false);

  // Función para exportar a Excel
  const handleExportToExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      // Obtener todos los datos sin paginación para exportar
      const response = await generationsService.list({
        limit: 999999, // Límite muy alto para obtener todos los registros sin paginar
        search: searchTerm || undefined,
        activeOnly: activeOnly || undefined,
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      });

      // Columnas para exportación (incluyendo estado)
      const exportColumns: TableColumn<Generation>[] = [
        {
          key: 'name',
          label: 'Nombre',
        },
        {
          key: 'startYear',
          label: 'Año Inicio',
        },
        {
          key: 'endYear',
          label: 'Año Fin',
        },
        {
          key: 'description',
          label: 'Descripción',
        },
        {
          key: 'isActive',
          label: 'Estado',
        },
      ];

      // Preparar datos para exportación
      const exportData = response.data.map((generation) => {
        const startYear =
          generation.startYear instanceof Date
            ? generation.startYear.getFullYear()
            : new Date(generation.startYear).getFullYear();
        const endYear =
          generation.endYear instanceof Date
            ? generation.endYear.getFullYear()
            : new Date(generation.endYear).getFullYear();

        return {
          ...generation,
          startYear: startYear.toString(),
          endYear: endYear.toString(),
          isActive: generation.isActive ? 'Activa' : 'Inactiva',
        };
      });

      // Generar nombre de archivo con fecha
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `generaciones-${dateStr}`;

      // Exportar
      await exportTable({
        filename,
        sheetName: 'Generaciones',
        columns: exportColumns,
        data: exportData,
        title: 'Generaciones',
      });

      showToast({
        type: 'success',
        title: 'Exportación exitosa',
        message: 'Las generaciones se han exportado a Excel correctamente',
      });
    } catch (error) {
      console.error('Error al exportar generaciones:', error);
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo exportar las generaciones',
      });
    } finally {
      setIsExporting(false);
    }
  }, [searchTerm, activeOnly, sortBy, sortOrder, showToast]);

  // Acciones de fila usando createStatusActions
  const getRowActions = useCallback(
    (generation: Generation): DropdownMenuItem[] => {
      // Obtener acciones basadas en el estado usando createStatusActions
      const statusActions = createStatusActions(generation, {
        currentStatus: generation.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(generation) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(generation),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(generation),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(generation) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(generation),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(generation),
              },
            ],
            showSeparator: true,
          },
        },
      });

      // Agregar "Ver detalles" al inicio del menú, seguido de un separador
      return [
        { label: 'Ver detalles', onClick: () => handleOpenDetail(generation) },
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
          title="Generaciones"
          searchPlaceholder="Buscar generación..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          primaryAction={{
            label: 'Añadir',
            onClick: () => setIsCreateModalOpen(true),
          }}
          exportAction={{
            label: 'Exportar a Excel',
            onClick: handleExportToExcel,
            isLoading: isExporting,
            disabled: isLoadingList || generations.length === 0,
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
            data={generations}
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
      <GenerationForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedGeneration && (
        <GenerationForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGeneration(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedGeneration}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles de la Generación"
        data={selectedGeneration}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedGeneration(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
