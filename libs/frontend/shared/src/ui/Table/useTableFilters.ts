import { useMemo } from 'react';
import { getNestedValue } from './utils';

/**
 * Hook personalizado para manejar el filtrado de datos en una tabla
 * 
 * Este hook filtra los datos basándose en los filtros seleccionados por columna.
 * 
 * @param data - Array de datos a filtrar
 * @param filters - Objeto con los filtros: { [columnKey]: string[] }
 * @returns Array de datos filtrados
 * 
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<Record<string, string[]>>({});
 * 
 * const filteredData = useTableFilters(tableData, filters);
 * 
 * // Filtrar por estado
 * setFilters({ estado: ['active', 'paused'] });
 * ```
 */
export function useTableFilters<T = any>(
  data: T[],
  filters: Record<string, string[]>
): T[] {
  const filteredData = useMemo(() => {
    // Si no hay filtros activos, retornar todos los datos
    const hasActiveFilters = Object.values(filters).some(
      (values) => values.length > 0
    );

    if (!hasActiveFilters) {
      return [...data];
    }

    // Aplicar filtros
    return data.filter((row) => {
      return Object.entries(filters).every(([columnKey, selectedValues]) => {
        // Si no hay valores seleccionados para esta columna, no filtrar
        if (selectedValues.length === 0) {
          return true;
        }

        // Obtener el valor de la fila para esta columna
        const value = getNestedValue(row, columnKey);
        const stringValue = value !== null && value !== undefined ? String(value) : '';

        // Verificar si el valor está en los valores seleccionados
        return selectedValues.includes(stringValue);
      });
    });
  }, [data, filters]);

  return filteredData;
}
