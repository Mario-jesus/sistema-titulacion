import { ReactNode, useState, useRef, useEffect } from 'react';
import { DropdownMenu, DropdownMenuItem } from '../DropdownMenu/DropdownMenu';

export type TableStatus = string;
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableStatusConfig {
  status: TableStatus;
  label: string;
  /** Color del punto y texto (opcional, usa el color por defecto del status si no se proporciona) */
  color?: {
    dot: string;
    text: string;
  };
}

export interface TableStatusColors {
  [key: string]: {
    dot: string;
    text: string;
  };
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  statusColumn?: {
    key: string;
    getStatus: (row: T) => TableStatusConfig;
    /** Colores personalizados para los estados (opcional) */
    colors?: TableStatusColors;
  };
  onSort?: (columnKey: string, direction: SortDirection) => void;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  /** Acciones del menú desplegable para cada fila */
  rowActions?: (row: T) => DropdownMenuItem[];
}

// Colores por defecto para compatibilidad hacia atrás
const defaultStatusColors: TableStatusColors = {
  active: {
    dot: 'bg-[var(--color-green)]',
    text: 'text-[var(--color-green)]',
  },
  paused: {
    dot: 'bg-[var(--color-yellow)]',
    text: 'text-[var(--color-yellow)]',
  },
  cancelled: {
    dot: 'bg-[var(--color-salmon)]',
    text: 'text-[var(--color-salmon)]',
  },
  inactive: {
    dot: 'bg-[var(--color-gray-5)]',
    text: 'text-[var(--color-gray-5)]',
  },
};

/**
 * Componente de tabla genérico con soporte para modo claro y oscuro
 *
 * Este componente proporciona una tabla completa con funcionalidades de ordenamiento,
 * columnas personalizables, estados visuales y soporte automático para modo claro y oscuro.
 *
 * @example
 * ```tsx
 * // Tabla básica
 * <Table
 *   columns={[
 *     { key: 'nombre', label: 'Nombre', sortable: true },
 *     { key: 'descripcion', label: 'Descripción' },
 *   ]}
 *   data={[
 *     { nombre: 'Residencia', descripcion: 'Proyecto de residencia' },
 *     { nombre: 'Tesis', descripcion: 'Proyecto de tesis' },
 *   ]}
 * />
 *
 * // Tabla con ordenamiento
 * <Table
 *   columns={[
 *     { key: 'nombre', label: 'Nombre', sortable: true },
 *     { key: 'descripcion', label: 'Descripción', sortable: true },
 *   ]}
 *   data={data}
 *   onSort={(columnKey, direction) => {
 *     console.log(`Ordenar por ${columnKey}: ${direction}`);
 *   }}
 * />
 *
 * // Tabla con columna de estado
 * <Table
 *   columns={[
 *     { key: 'nombre', label: 'Nombre' },
 *     { key: 'descripcion', label: 'Descripción' },
 *   ]}
 *   data={data}
 *   statusColumn={{
 *     key: 'estado',
 *     getStatus: (row) => ({
 *       status: row.estado === 'activo' ? 'active' : 'paused',
 *       label: row.estado === 'activo' ? 'Activo' : 'Pausado',
 *     }),
 *   }}
 * />
 *
 * // Tabla con estados personalizados (solo activo/inactivo)
 * <Table
 *   columns={columns}
 *   data={data}
 *   statusColumn={{
 *     key: 'estado',
 *     getStatus: (row) => ({
 *       status: row.activo ? 'activo' : 'inactivo',
 *       label: row.activo ? 'Activo' : 'Inactivo',
 *     }),
 *     colors: {
 *       activo: {
 *         dot: 'bg-[var(--color-green)]',
 *         text: 'text-[var(--color-green)]',
 *       },
 *       inactivo: {
 *         dot: 'bg-[var(--color-gray-5)]',
 *         text: 'text-[var(--color-gray-5)]',
 *       },
 *     },
 *   }}
 * />
 *
 * // Tabla con colores personalizados por fila
 * <Table
 *   columns={columns}
 *   data={data}
 *   statusColumn={{
 *     key: 'estado',
 *     getStatus: (row) => ({
 *       status: row.estado,
 *       label: row.estadoLabel,
 *       color: {
 *         dot: row.colorDot,
 *         text: row.colorText,
 *       },
 *     }),
 *   }}
 * />
 *
 * // Tabla con render personalizado
 * <Table
 *   columns={[
 *     { key: 'nombre', label: 'Nombre' },
 *     {
 *       key: 'fecha',
 *       label: 'Fecha',
 *       render: (value) => new Date(value).toLocaleDateString(),
 *     },
 *   ]}
 *   data={data}
 * />
 *
 * // Tabla con click en filas
 * <Table
 *   columns={columns}
 *   data={data}
 *   onRowClick={(row) => {
 *     console.log('Fila clickeada:', row);
 *   }}
 * />
 *
 * // Tabla con clases personalizadas en filas
 * <Table
 *   columns={columns}
 *   data={data}
 *   rowClassName={(row, index) => {
 *     return index % 2 === 0 ? 'bg-gray-2-light' : '';
 *   }}
 * />
 * ```
 */
export function Table<T = any>({
  columns,
  data,
  statusColumn,
  onSort,
  className = '',
  rowClassName,
  onRowClick,
  rowActions,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    items: DropdownMenuItem[];
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Asegurar que el scroll comience desde el inicio
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [data, columns]);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable || !onSort) return;

    let newDirection: SortDirection = 'asc';
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortColumn(newDirection ? columnKey : null);
    setSortDirection(newDirection);
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return null;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-1 scale-120"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="m6.293 13.293 1.414 1.414L12 10.414l4.293 4.293 1.414-1.414L12 7.586z"></path>
          </svg>
        );
      } else {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 ml-1 scale-120"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
          </svg>
        );
      }
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        className="w-4 h-4 ml-1 opacity-90 scale-75"
        viewBox="0 0 24 24"
        style={{ color: 'var(--color-base-secondary-typo)' }}
      >
        <path d="M6.227 11h11.547c.862 0 1.32-1.02.747-1.665L12.748 2.84a.998.998 0 0 0-1.494 0L5.479 9.335C4.906 9.98 5.364 11 6.227 11zm5.026 10.159a.998.998 0 0 0 1.494 0l5.773-6.495c.574-.644.116-1.664-.747-1.664H6.227c-.862 0-1.32 1.02-.747 1.665l5.773 6.494z"></path>
      </svg>
    );
  };

  const getCellValue = (row: T, column: TableColumn<T>): any => {
    const keys = column.key.split('.');
    let value: any = row;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  const allColumns = statusColumn
    ? [
        ...columns,
        {
          key: statusColumn.key,
          label: 'Estado',
          sortable: false,
        } as TableColumn<T>,
      ]
    : columns;

  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-x-auto border bg-(--color-component-bg) border-(--color-gray-1) w-full ${className}`}
    >
      <table
        className="border-collapse"
        style={{
          tableLayout: 'auto',
          width: 'max-content',
          minWidth: '100%',
          display: 'table',
        }}
      >
        <thead>
          <tr className="bg-gray-2-light dark:bg-gray-3-dark">
            {allColumns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-medium whitespace-nowrap hover:bg-gray-3-light/50 active:bg-gray-3-light dark:hover:bg-gray-6-dark/50 dark:active:bg-gray-6-dark ${
                  column.sortable ? 'cursor-pointer select-none' : ''
                }`}
                style={{
                  color: 'var(--color-base-secondary-typo)',
                  textAlign: column.align || 'left',
                }}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className="flex items-center">
                  {column.label}
                  {getSortIcon(column.key, column.sortable)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={allColumns.length}
                className="px-4 py-8 text-center text-sm"
                style={{ color: 'var(--color-base-secondary-typo)' }}
              >
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const statusConfig = statusColumn
                ? statusColumn.getStatus(row)
                : null;
              // Usar colores personalizados del statusConfig, o del statusColumn.colors, o los por defecto
              const statusColorsMap =
                statusColumn?.colors || defaultStatusColors;
              const statusColor =
                statusConfig?.color ||
                statusColorsMap[statusConfig?.status || ''];

              const rowClasses = [
                'border-b border-gray-1-light dark:border-gray-5-dark',
                'hover:bg-gray-3-light/50 active:bg-gray-3-light dark:hover:bg-gray-6-dark/50 dark:active:bg-gray-6-dark',
                (onRowClick || rowActions) && 'cursor-pointer',
                rowClassName && rowClassName(row, rowIndex),
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={rowIndex}
                  className={rowClasses}
                  onContextMenu={(e) => {
                    // Prevenir el menú contextual del navegador
                    e.preventDefault();

                    if (rowActions) {
                      const items = rowActions(row);
                      if (items.length > 0) {
                        setMenuState({
                          isOpen: true,
                          position: {
                            x: e.clientX + 8,
                            y: e.clientY - 4,
                          },
                          items,
                        });
                      }
                    }
                  }}
                  onClick={(e) => {
                    // En móviles, si hay rowActions, mostrar el menú en lugar del modal
                    const isMobile = window.innerWidth < 768; // Breakpoint md de Tailwind

                    if (isMobile && rowActions) {
                      const items = rowActions(row);
                      if (items.length > 0) {
                        e.preventDefault();
                        setMenuState({
                          isOpen: true,
                          position: {
                            x: e.clientX || window.innerWidth / 2,
                            y: e.clientY || window.innerHeight / 2,
                          },
                          items,
                        });
                        return;
                      }
                    }

                    // En desktop o si no hay rowActions, mantener comportamiento original
                    if (onRowClick) {
                      onRowClick(row);
                    }
                  }}
                >
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    const cellContent = column.render
                      ? column.render(value, row)
                      : value;

                    return (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm whitespace-nowrap"
                        style={{
                          color: 'var(--color-base-primary-typo)',
                          textAlign: column.align || 'left',
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                  {statusColumn && statusConfig && (
                    <td
                      className="px-4 py-3 text-sm whitespace-nowrap"
                      style={{
                        textAlign: 'left',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {statusColor && (
                          <>
                            <span
                              className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                            />
                            <span className={statusColor.text}>
                              {statusConfig.label}
                            </span>
                          </>
                        )}
                        {!statusColor && (
                          <span
                            style={{
                              color: 'var(--color-base-primary-typo)',
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Menú desplegable */}
      <DropdownMenu
        isOpen={menuState.isOpen}
        onClose={() => setMenuState((prev) => ({ ...prev, isOpen: false }))}
        position={menuState.position}
        items={menuState.items}
      />
    </div>
  );
}
