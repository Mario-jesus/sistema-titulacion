import { useMemo } from 'react';
import { getNestedValue } from '../Table/utils';
import { Button } from '../Button/Button';

export interface FilterConfig<T = any> {
  /** Clave de la columna a filtrar */
  columnKey: string;
  /** Etiqueta a mostrar */
  label: string;
}

export interface FilterPanelProps<T = any> {
  /** Datos de la tabla */
  data: T[];
  /** Configuración de filtros por columna */
  filterConfigs: FilterConfig<T>[];
  /** Valores seleccionados: { [columnKey]: string[] } */
  selectedFilters: Record<string, string[]>;
  /** Callback cuando cambian los filtros */
  onFilterChange: (columnKey: string, values: string[]) => void;
  /** Callback para limpiar filtros */
  onReset?: () => void;
}

/**
 * Panel de filtros con checkboxes para valores únicos de columnas
 * 
 * Este componente extrae automáticamente los valores únicos de las columnas especificadas
 * y los muestra como checkboxes para filtrar los datos de la tabla.
 * 
 * @example
 * ```tsx
 * <FilterPanel
 *   data={tableData}
 *   filterConfigs={[
 *     { columnKey: 'estado', label: 'Estado' },
 *     { columnKey: 'categoria', label: 'Categoría' },
 *   ]}
 *   selectedFilters={filters}
 *   onFilterChange={(columnKey, values) => {
 *     setFilters(prev => ({ ...prev, [columnKey]: values }));
 *   }}
 *   onReset={() => setFilters({})}
 * />
 * ```
 */
export function FilterPanel<T = any>({
  data,
  filterConfigs,
  selectedFilters,
  onFilterChange,
  onReset,
}: FilterPanelProps<T>) {
  // Extraer valores únicos para cada columna
  const uniqueValues = useMemo(() => {
    const values: Record<string, string[]> = {};

    filterConfigs.forEach((config) => {
      const unique = new Set<string>();

      data.forEach((row) => {
        const value = getNestedValue(row, config.columnKey);
        if (value !== null && value !== undefined) {
          unique.add(String(value));
        }
      });

      values[config.columnKey] = Array.from(unique).sort();
    });

    return values;
  }, [data, filterConfigs]);

  const handleCheckboxChange = (columnKey: string, value: string, checked: boolean) => {
    const current = selectedFilters[columnKey] || [];
    const updated = checked
      ? [...current, value]
      : current.filter((v) => v !== value);

    onFilterChange(columnKey, updated);
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (values) => values.length > 0
  );

  return (
    <div className="p-4 min-w-[240px] max-w-[300px]">
      <div className="flex flex-col gap-4">
        {filterConfigs.map((config) => {
          const values = uniqueValues[config.columnKey] || [];
          const selected = selectedFilters[config.columnKey] || [];

          if (values.length === 0) return null;

          return (
            <div key={config.columnKey} className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{
                  color: 'var(--color-base-primary-typo)',
                }}
              >
                {config.label}
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {values.map((value) => {
                  const isChecked = selected.includes(value);

                  return (
                    <label
                      key={value}
                      className="flex items-center gap-2 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(config.columnKey, value, e.target.checked)
                        }
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{
                          accentColor: 'var(--color-primary-color)',
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--color-base-primary-typo)',
                        }}
                      >
                        {value}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de limpiar */}
      {onReset && (
        <div 
          className="flex items-center justify-start mt-4 pt-4 border-t" 
          style={{ borderColor: 'var(--color-gray-1)' }}
        >
          <Button
            variant="ghost"
            size="small"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}
