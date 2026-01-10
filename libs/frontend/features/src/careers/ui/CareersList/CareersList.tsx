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
import { useCareers } from '../../lib/useCareers';
import { CareerForm } from '../CareerForm/CareerForm';
import type { Career } from '@entities/career';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar y gestionar carreras
 * Contiene toda la lógica de negocio y UI para la gestión de carreras
 */
export function CareersList() {
  const { showToast } = useToast();
  const {
    careers,
    pagination,
    isLoadingList,
    listError,
    listCareers,
    createCareer,
    updateCareer,
    deleteCareer,
    activateCareer,
    deactivateCareer,
    clearListErrors,
  } = useCareers();

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
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  // Obtener activeOnly de filters
  const activeOnly = filters.activeOnly === true;

  // Cargar carreras
  const loadCareers = useCallback(async () => {
    try {
      await listCareers({
        page,
        limit: 10,
        search: searchTerm || undefined,
        activeOnly: activeOnly || undefined,
        // Solo incluir sortBy y sortOrder si ambos están definidos
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      });
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      showToast({
        type: 'error',
        title: 'Error al cargar carreras',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las carreras',
      });
    }
  }, [page, searchTerm, activeOnly, sortBy, sortOrder, listCareers, showToast]);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

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
        await createCareer(data);
        setIsCreateModalOpen(false);
        showToast({
          type: 'success',
          title: 'Carrera creada',
          message: 'La carrera se ha creado exitosamente',
        });
        loadCareers();
      } catch (error) {
        console.error('Error al crear carrera:', error);
        showToast({
          type: 'error',
          title: 'Error al crear carrera',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo crear la carrera',
        });
        throw error;
      }
    },
    [createCareer, loadCareers, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedCareer) return;
      try {
        await updateCareer(selectedCareer.id, data);
        setIsEditModalOpen(false);
        setSelectedCareer(null);
        showToast({
          type: 'success',
          title: 'Carrera actualizada',
          message: 'La carrera se ha actualizado exitosamente',
        });
        loadCareers();
      } catch (error) {
        console.error('Error al actualizar carrera:', error);
        showToast({
          type: 'error',
          title: 'Error al actualizar carrera',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar la carrera',
        });
        throw error;
      }
    },
    [selectedCareer, updateCareer, loadCareers, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (career: Career) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar la carrera "${career.name}"?`
        )
      ) {
        return;
      }
      try {
        await deleteCareer(career.id);
        showToast({
          type: 'success',
          title: 'Carrera eliminada',
          message: `La carrera "${career.name}" se ha eliminado exitosamente`,
        });
        loadCareers();
      } catch (error) {
        console.error('Error al eliminar carrera:', error);
        showToast({
          type: 'error',
          title: 'Error al eliminar carrera',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo eliminar la carrera',
        });
      }
    },
    [deleteCareer, loadCareers, showToast]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (career: Career) => {
      try {
        if (career.isActive) {
          await deactivateCareer(career.id);
          showToast({
            type: 'success',
            title: 'Carrera desactivada',
            message: `La carrera "${career.name}" se ha desactivado exitosamente`,
          });
        } else {
          await activateCareer(career.id);
          showToast({
            type: 'success',
            title: 'Carrera activada',
            message: `La carrera "${career.name}" se ha activado exitosamente`,
          });
        }
        loadCareers();
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        showToast({
          type: 'error',
          title: 'Error al cambiar estado',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado de la carrera',
        });
      }
    },
    [activateCareer, deactivateCareer, loadCareers, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((career: Career) => {
    setSelectedCareer(career);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((career: Career) => {
    setSelectedCareer(career);
    setIsDetailModalOpen(true);
  }, []);

  // Columnas de la tabla
  const columns: TableColumn<Career>[] = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'shortName',
      label: 'Nombre Corto',
      sortable: true,
    },
    {
      key: 'modality',
      label: 'Modalidad',
      render: (value: any) => {
        // value es el objeto modality completo
        return value?.name || '-';
      },
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value: string | null) => value || '-',
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<Career>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'shortName', label: 'Nombre Corto' },
    {
      key: 'modality',
      label: 'Modalidad',
      render: (value: any) => {
        return value?.name || 'Sin modalidad';
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

  // Acciones de fila usando createStatusActions
  const getRowActions = useCallback(
    (career: Career): DropdownMenuItem[] => {
      // Obtener acciones basadas en el estado usando createStatusActions
      const statusActions = createStatusActions(career, {
        currentStatus: career.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(career) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(career),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(career),
              },
            ],
            showSeparator: true,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(career) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(career),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(career),
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
          onClick: () => handleOpenDetail(career),
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
          title="Carreras"
          searchPlaceholder="Buscar carrera..."
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
            data={careers}
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
      <CareerForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Modal de edición */}
      {selectedCareer && (
        <CareerForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCareer(null);
          }}
          onSubmit={handleEdit}
          mode="edit"
          initialData={selectedCareer}
        />
      )}

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles de la Carrera"
        data={selectedCareer}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCareer(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
