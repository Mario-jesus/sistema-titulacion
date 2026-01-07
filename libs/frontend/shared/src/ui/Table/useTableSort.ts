import { useState, useMemo } from 'react';
import { SortDirection } from './Table';
import { sortTableData } from './utils';

/**
 * Hook personalizado para manejar el ordenamiento de datos en una tabla
 * 
 * Este hook maneja el estado del ordenamiento y proporciona los datos ordenados
 * automáticamente basándose en la columna y dirección seleccionadas.
 * 
 * @param data - Array de datos a ordenar
 * @param initialSortColumn - Columna inicial para ordenar (opcional)
 * @param initialSortDirection - Dirección inicial del ordenamiento (opcional)
 * @returns Objeto con los datos ordenados, funciones de control y estado
 * 
 * @example
 * ```tsx
 * const { sortedData, handleSort, sortColumn, sortDirection } = useTableSort(tableData);
 * 
 * <Table
 *   columns={columns}
 *   data={sortedData}
 *   onSort={handleSort}
 * />
 * ```
 */
export function useTableSort<T = any>(
  data: T[],
  initialSortColumn: string | null = null,
  initialSortDirection: SortDirection = null
) {
  const [sortColumn, setSortColumn] = useState<string | null>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  // Calcular datos ordenados
  const sortedData = useMemo(() => {
    return sortTableData(data, sortColumn, sortDirection);
  }, [data, sortColumn, sortDirection]);

  // Handler para cuando se hace click en una columna
  const handleSort = (columnKey: string, direction: SortDirection) => {
    setSortColumn(direction ? columnKey : null);
    setSortDirection(direction);
  };

  // Función para resetear el ordenamiento
  const resetSort = () => {
    setSortColumn(null);
    setSortDirection(null);
  };

  return {
    sortedData,
    handleSort,
    sortColumn,
    sortDirection,
    resetSort,
  };
}
