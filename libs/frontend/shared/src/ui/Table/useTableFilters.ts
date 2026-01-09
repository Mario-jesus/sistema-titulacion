import { useMemo } from 'react';
import { getNestedValue } from './utils';

/**
 * Hook personalizado para manejar el filtrado de datos en una tabla
 *
 * Este hook filtra los datos basándose en los filtros seleccionados por columna.
 * Soporta múltiples tipos de filtros: string[], string, y boolean.
 * Para datos locales, normalmente se usa string[] (múltiples valores seleccionables).
 *
 * @param data - Array de datos a filtrar
 * @param filters - Objeto con los filtros: { [columnKey]: string[] | string | boolean }
 * @returns Array de datos filtrados
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});
 *
 * const filteredData = useTableFilters(tableData, filters);
 *
 * // Filtrar por estado (múltiples valores)
 * setFilters({ estado: ['active', 'paused'] });
 *
 * // Filtrar por un solo valor
 * setFilters({ estado: 'active' });
 *
 * // Boolean se ignora en filtros locales (se usa en backend)
 * setFilters({ activeOnly: true });
 * ```
 */
export function useTableFilters<T = any>(
  data: T[],
  filters: Record<string, string | string[] | boolean>
): T[] {
  const filteredData = useMemo(() => {
    // Si no hay filtros activos, retornar todos los datos
    const hasActiveFilters = Object.values(filters).some((value) => {
      if (typeof value === 'boolean') return false; // Boolean se ignora en filtros locales
      if (typeof value === 'string') return value !== '';
      if (Array.isArray(value)) return value.length > 0;
      return false;
    });

    if (!hasActiveFilters) {
      return [...data];
    }

    // Aplicar filtros
    return data.filter((row) => {
      return Object.entries(filters).every(([columnKey, filterValue]) => {
        // Boolean se ignora en filtros locales (se maneja en el backend)
        if (typeof filterValue === 'boolean') {
          return true;
        }

        // Convertir a array para manejar ambos casos (string y string[])
        const selectedValues = Array.isArray(filterValue)
          ? filterValue
          : filterValue !== ''
          ? [filterValue]
          : [];

        // Si no hay valores seleccionados para esta columna, no filtrar
        if (selectedValues.length === 0) {
          return true;
        }

        // Obtener el valor de la fila para esta columna
        const value = getNestedValue(row, columnKey);
        const stringValue =
          value !== null && value !== undefined ? String(value) : '';

        // Verificar si el valor está en los valores seleccionados
        return selectedValues.includes(stringValue);
      });
    });
  }, [data, filters]);

  return filteredData;
}
