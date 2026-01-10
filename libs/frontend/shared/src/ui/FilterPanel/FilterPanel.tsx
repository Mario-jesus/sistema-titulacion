import { useMemo, useState, useEffect } from 'react';
import { getNestedValue } from '../Table/utils';
import { Button } from '../Button/Button';

export type FilterType = 'checkbox' | 'toggle' | 'select';

export interface FilterOption {
  /** Valor del filtro */
  value: string;
  /** Etiqueta a mostrar */
  label: string;
}

export interface FilterConfig {
  /** Clave de la columna a filtrar (o del query parameter si se usa con backend) */
  columnKey: string;
  /** Etiqueta a mostrar */
  label: string;
  /** Tipo de filtro: 'checkbox' (múltiples valores), 'toggle' (boolean), 'select' (único valor) */
  type?: FilterType;
  /** Opciones predefinidas (para trabajar con backend). Si no se proporciona, extrae de data */
  options?: FilterOption[];
  /** Si se debe extraer opciones de los datos locales (default: true si no hay options) */
  extractFromData?: boolean;
}

export interface FilterPanelProps<T = Record<string, unknown>> {
  /** Datos de la tabla (opcional si todas las opciones están predefinidas) */
  data?: T[];
  /** Configuración de filtros por columna */
  filterConfigs: FilterConfig[];
  /** Valores seleccionados: { [columnKey]: string | string[] } */
  selectedFilters: Record<string, string | string[] | boolean>;
  /** Callback cuando cambian los filtros */
  onFilterChange: (
    columnKey: string,
    value: string | string[] | boolean
  ) => void;
  /** Callback para limpiar filtros */
  onReset?: () => void;
}

/**
 * Panel de filtros con soporte para múltiples tipos: checkboxes, toggles y selects
 *
 * Este componente puede trabajar de dos formas:
 * 1. Con datos locales: extrae automáticamente valores únicos de las columnas
 * 2. Con opciones predefinidas: usa opciones proporcionadas (ideal para trabajar con backend)
 *
 * Tipos de filtros soportados:
 * - 'checkbox': Múltiples valores seleccionables (array)
 * - 'toggle': Boolean simple (true/false)
 * - 'select': Valor único (string)
 *
 * @example
 * // Uso con datos locales (compatibilidad hacia atrás)
 * ```tsx
 * <FilterPanel
 *   data={tableData}
 *   filterConfigs={[
 *     { columnKey: 'estado', label: 'Estado' },
 *   ]}
 *   selectedFilters={filters}
 *   onFilterChange={(columnKey, value) => handleFilterChange(columnKey, value)}
 *   onReset={() => setFilters({})}
 * />
 * ```
 *
 * @example
 * // Uso con opciones predefinidas del backend
 * ```tsx
 * <FilterPanel
 *   filterConfigs={[
 *     {
 *       columnKey: 'careerId',
 *       label: 'Carrera',
 *       type: 'checkbox',
 *       options: careers.map(c => ({ value: c.id, label: c.name }))
 *     },
 *     {
 *       columnKey: 'status',
 *       label: 'Estado',
 *       type: 'checkbox',
 *       options: [
 *         { value: 'ACTIVO', label: 'Activo' },
 *         { value: 'PAUSADO', label: 'Pausado' },
 *         { value: 'CANCELADO', label: 'Cancelado' }
 *       ]
 *     },
 *     {
 *       columnKey: 'activeOnly',
 *       label: 'Solo activos',
 *       type: 'toggle'
 *     }
 *   ]}
 *   selectedFilters={filters}
 *   onFilterChange={(columnKey, value) => handleFilterChange(columnKey, value)}
 *   onReset={() => setFilters({})}
 * />
 * ```
 */
export function FilterPanel<T = Record<string, unknown>>({
  data,
  filterConfigs,
  selectedFilters,
  onFilterChange,
  onReset,
}: FilterPanelProps<T>) {
  // Estado interno para filtros temporales (antes de aplicar)
  const [tempFilters, setTempFilters] = useState<
    Record<string, string | string[] | boolean>
  >(selectedFilters);

  // Sincronizar filtros temporales cuando cambian los seleccionados externamente
  useEffect(() => {
    setTempFilters(selectedFilters);
  }, [selectedFilters]);

  // Obtener opciones para cada filtro (predefinidas o extraídas de datos)
  const filterOptions = useMemo(() => {
    const options: Record<string, FilterOption[]> = {};

    filterConfigs.forEach((config) => {
      // Si tiene opciones predefinidas, usarlas
      if (config.options && config.options.length > 0) {
        options[config.columnKey] = config.options;
        return;
      }

      // Si extractFromData es false, no extraer de datos
      if (config.extractFromData === false) {
        options[config.columnKey] = [];
        return;
      }

      // Extraer de datos locales si están disponibles
      if (data && data.length > 0) {
        const unique = new Set<string>();

        data.forEach((row) => {
          const value = getNestedValue(row, config.columnKey);
          if (value !== null && value !== undefined) {
            unique.add(String(value));
          }
        });

        options[config.columnKey] = Array.from(unique)
          .sort()
          .map((value) => ({ value, label: value }));
      } else {
        options[config.columnKey] = [];
      }
    });

    return options;
  }, [data, filterConfigs]);

  const handleTempFilterChange = (
    columnKey: string,
    value: string | string[] | boolean
  ) => {
    setTempFilters((prev) => {
      const updated = { ...prev, [columnKey]: value };

      // Si es false, string vacío o array vacío, eliminar el filtro
      if (value === false) {
        delete updated[columnKey];
      } else if (typeof value === 'string' && value === '') {
        delete updated[columnKey];
      } else if (Array.isArray(value) && value.length === 0) {
        delete updated[columnKey];
      }

      return updated;
    });
  };

  const handleCheckboxChange = (
    columnKey: string,
    value: string,
    checked: boolean
  ) => {
    const config = filterConfigs.find((c) => c.columnKey === columnKey);
    const filterType = config?.type || 'checkbox';
    const current = tempFilters[columnKey];

    if (filterType === 'toggle') {
      // Para toggles, solo acepta boolean
      handleTempFilterChange(columnKey, checked);
    } else if (filterType === 'select') {
      // Para select, solo un valor
      handleTempFilterChange(columnKey, checked ? value : '');
    } else {
      // Para checkbox (múltiples valores)
      const currentArray = Array.isArray(current) ? current : [];
      const updated = checked
        ? [...currentArray, value]
        : currentArray.filter((v) => v !== value);
      handleTempFilterChange(columnKey, updated);
    }
  };

  // Aplicar filtros temporales
  const handleApply = () => {
    // Aplicar filtros que están en tempFilters
    Object.entries(tempFilters).forEach(([columnKey, value]) => {
      onFilterChange(columnKey, value);
    });

    // Eliminar filtros que estaban en selectedFilters pero no en tempFilters
    Object.keys(selectedFilters).forEach((columnKey) => {
      if (!(columnKey in tempFilters)) {
        // Eliminar el filtro (pasar false para toggles, '' para strings, [] para arrays)
        const config = filterConfigs.find((c) => c.columnKey === columnKey);
        const filterType = config?.type || 'checkbox';
        if (filterType === 'toggle') {
          onFilterChange(columnKey, false);
        } else if (filterType === 'select') {
          onFilterChange(columnKey, '');
        } else {
          onFilterChange(columnKey, []);
        }
      }
    });
  };

  // Verificar si hay filtros aplicados (para habilitar botón "Limpiar")
  const hasActiveFilters = Object.entries(selectedFilters).some(([, value]) => {
    if (typeof value === 'boolean') {
      return value === true;
    }
    if (typeof value === 'string') {
      return value !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return false;
  });

  // Verificar si hay cambios pendientes (filtros temporales diferentes a los seleccionados)
  const hasPendingChanges = useMemo(() => {
    return JSON.stringify(tempFilters) !== JSON.stringify(selectedFilters);
  }, [tempFilters, selectedFilters]);

  return (
    <div className="p-4 min-w-[240px] max-w-[300px]">
      <div className="flex flex-col gap-4">
        {filterConfigs.map((config) => {
          const options = filterOptions[config.columnKey] || [];
          const filterType = config.type || 'checkbox';
          const selected = tempFilters[config.columnKey];

          if (options.length === 0 && filterType !== 'toggle') return null;

          // Renderizado para toggle (boolean) - Switch visual
          if (filterType === 'toggle') {
            const isChecked = selected === true || selected === 'true';

            return (
              <div
                key={config.columnKey}
                className="flex items-center justify-between gap-2"
              >
                <label
                  className="text-sm font-medium cursor-pointer"
                  style={{
                    color: 'var(--color-base-primary-typo)',
                  }}
                  onClick={() =>
                    handleCheckboxChange(config.columnKey, 'true', !isChecked)
                  }
                >
                  {config.label}
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={() =>
                    handleCheckboxChange(config.columnKey, 'true', !isChecked)
                  }
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isChecked ? 'bg-(--color-primary-color)' : 'bg-(--color-gray-3)'}
                    focus:ring-(--color-primary-color)
                  `}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isChecked ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            );
          }

          // Renderizado para select (único valor)
          if (filterType === 'select') {
            const selectedValue = typeof selected === 'string' ? selected : '';

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
                <select
                  value={selectedValue}
                  onChange={(e) =>
                    handleTempFilterChange(config.columnKey, e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-component-bg)',
                    borderColor: 'var(--color-gray-1)',
                    color: 'var(--color-base-primary-typo)',
                  }}
                >
                  <option value="">Todos</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // Renderizado para checkbox (múltiples valores) - default
          const selectedArray = Array.isArray(selected) ? selected : [];

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
                {options.map((option) => {
                  const isChecked = selectedArray.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(
                            config.columnKey,
                            option.value,
                            e.target.checked
                          )
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
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div
        className="flex flex-row-reverse items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-3-light dark:border-gray-6-dark"
      >
        <Button
          variant="primary"
          size="small"
          onClick={handleApply}
          disabled={!hasPendingChanges}
        >
          Aplicar
        </Button>
        {onReset && (
          <Button
            variant="ghost"
            size="small"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
