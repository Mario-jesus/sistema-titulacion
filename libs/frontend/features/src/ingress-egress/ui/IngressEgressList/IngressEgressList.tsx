import { useEffect, useState, useCallback, useRef } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import { Table, useToast, FilterDropdown, Pagination } from '@shared/ui';
import { DetailModal } from '@shared/ui';
import type { DropdownMenuItem, FilterConfig } from '@shared/ui';
import { exportTable } from '@shared/lib/excel';
import { useIngressEgress } from '../../lib/useIngressEgress';
import { ingressEgressService } from '../../api/ingressEgressService';
import type { IngressEgress } from '@entities/ingress-egress';
import type { TableColumn, DetailField } from '@shared/ui';

/**
 * Componente para listar ingreso y egreso
 * Contiene toda la lógica de negocio y UI para visualizar estadísticas de ingreso y egreso
 * Este módulo es de solo lectura (no tiene CRUD)
 */
export function IngressEgressList() {
  const { showToast } = useToast();
  const {
    ingressEgressList,
    pagination,
    isLoadingList,
    listIngressEgress,
    getIngressEgressByGenerationAndCareer,
  } = useIngressEgress();

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

  // Estados para modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedIngressEgress, setSelectedIngressEgress] =
    useState<IngressEgress | null>(null);

  // Cargar datos de ingreso y egreso
  const loadIngressEgress = useCallback(async () => {
    const result = await listIngressEgress({
      page,
      limit: 10,
      search: searchTerm || undefined,
      // Solo incluir sortBy y sortOrder si ambos están definidos
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
      ...(filters.generationId
        ? { generationId: filters.generationId as string }
        : {}),
      ...(filters.careerId ? { careerId: filters.careerId as string } : {}),
    });

    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Error al cargar ingreso y egreso',
        message:
          result.error || 'No se pudieron cargar los datos de ingreso y egreso',
      });
    }
  }, [
    page,
    searchTerm,
    sortBy,
    sortOrder,
    filters,
    listIngressEgress,
    showToast,
  ]);

  useEffect(() => {
    loadIngressEgress();
  }, [loadIngressEgress]);

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

  // Abrir modal de detalles
  const handleOpenDetail = useCallback(
    async (ingressEgress: IngressEgress) => {
      setSelectedIngressEgress(ingressEgress);
      setIsDetailModalOpen(true);

      try {
        const result = await getIngressEgressByGenerationAndCareer(
          ingressEgress.generationId,
          ingressEgress.careerId
        );

        if (!result.success) {
          console.error('Error al cargar detalles:', result.error);
          showToast({
            type: 'error',
            title: 'Error al cargar detalles',
            message: result.error,
          });
          return;
        }

        setSelectedIngressEgress(result.data);
      } catch (error) {
        console.error('Error al cargar detalles:', error);
        showToast({
          type: 'error',
          title: 'Error al cargar detalles',
          message:
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los detalles',
        });
      }
    },
    [getIngressEgressByGenerationAndCareer, showToast]
  );

  // Columnas de la tabla
  const columns: TableColumn<IngressEgress>[] = [
    {
      key: 'generationName',
      label: 'Generación',
      sortable: true,
      render: (value: string | null) => value || '-',
    },
    {
      key: 'careerName',
      label: 'Carrera',
      sortable: true,
    },
    {
      key: 'admissionNumber',
      label: 'Ingreso',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'egressNumber',
      label: 'Egreso',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<IngressEgress>[] = [
    {
      key: 'generationName',
      label: 'Generación',
      render: (value: string | null) => value || '-',
    },
    {
      key: 'careerName',
      label: 'Carrera',
    },
    {
      key: 'admissionNumber',
      label: 'Número de Ingreso',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'egressNumber',
      label: 'Número de Egreso',
      render: (value: number) => value.toLocaleString(),
    },
  ];

  // Configuración de filtros (básicos, sin selects complejos por ahora)
  const filterConfigs: FilterConfig[] = [
    // Aquí se pueden agregar más filtros si es necesario
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

  // Estado para exportación
  const [isExporting, setIsExporting] = useState(false);

  // Función para exportar a Excel
  const handleExportToExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      // Obtener todos los datos sin paginación para exportar
      const response = await ingressEgressService.list({
        limit: 999999, // Límite muy alto para obtener todos los registros sin paginar
        search: searchTerm || undefined,
        ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
        ...(filters.generationId
          ? { generationId: filters.generationId as string }
          : {}),
        ...(filters.careerId ? { careerId: filters.careerId as string } : {}),
      });

      // Columnas para exportación
      const exportColumns: TableColumn<IngressEgress>[] = [
        {
          key: 'generationName',
          label: 'Generación',
        },
        {
          key: 'careerName',
          label: 'Carrera',
        },
        {
          key: 'admissionNumber',
          label: 'Ingreso',
        },
        {
          key: 'egressNumber',
          label: 'Egreso',
        },
      ];

      // Preparar datos para exportación
      // Los números se exportan como números (sin formato de miles)
      const exportData = response.data.map((item) => ({
        ...item,
        admissionNumber: item.admissionNumber,
        egressNumber: item.egressNumber,
      }));

      // Generar nombre de archivo con fecha
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `ingreso-egreso-${dateStr}`;

      // Exportar
      await exportTable({
        filename,
        sheetName: 'Ingreso y Egreso',
        columns: exportColumns,
        data: exportData,
        title: 'Ingreso y Egreso',
      });

      showToast({
        type: 'success',
        title: 'Exportación exitosa',
        message:
          'Los datos de ingreso y egreso se han exportado a Excel correctamente',
      });
    } catch (error) {
      console.error('Error al exportar ingreso y egreso:', error);
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudo exportar los datos de ingreso y egreso',
      });
    } finally {
      setIsExporting(false);
    }
  }, [searchTerm, sortBy, sortOrder, filters, showToast]);

  // Acciones de fila (solo ver detalles, sin editar/eliminar)
  const getRowActions = useCallback(
    (ingressEgress: IngressEgress): DropdownMenuItem[] => {
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(ingressEgress),
        },
      ];
    },
    [handleOpenDetail]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para PageHeader */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Ingreso y Egreso"
          searchPlaceholder="Buscar por generación o carrera..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          exportAction={{
            label: 'Exportar a Excel',
            onClick: handleExportToExcel,
            isLoading: isExporting,
            disabled: isLoadingList || ingressEgressList.length === 0,
          }}
          filters={
            filterConfigs.length > 0
              ? {
                  label: 'Filtros',
                  onClick: () => setIsFiltersOpen(!isFiltersOpen),
                  isActive: hasActiveFilters,
                  buttonRef: filterButtonRef,
                }
              : undefined
          }
        />

        {/* FilterDropdown */}
        {filterConfigs.length > 0 && (
          <FilterDropdown
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            triggerRef={filterButtonRef}
            filterConfigs={filterConfigs}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}
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
            data={ingressEgressList}
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

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles de Ingreso y Egreso"
        data={selectedIngressEgress}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIngressEgress(null);
        }}
        fields={detailFields}
        maxWidth="lg"
      />
    </div>
  );
}
