import { useEffect, useState, useRef } from 'react';
import { FilterPanel, FilterPanelProps } from '../FilterPanel/FilterPanel';

export interface FilterDropdownProps<T = any> extends FilterPanelProps<T> {
  /** Si el dropdown está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra */
  onClose: () => void;
  /** Referencia al botón que activa el dropdown */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Dropdown que muestra un panel de filtros
 *
 * Este componente posiciona un FilterPanel como un dropdown cerca del botón
 * que lo activa, similar a un menú desplegable.
 *
 * Soporta todos los tipos de filtros del FilterPanel: checkbox, toggle y select.
 * Puede trabajar con datos locales o con opciones predefinidas del backend.
 *
 * @example
 * // Uso básico con datos locales
 * ```tsx
 * const filterButtonRef = useRef<HTMLButtonElement>(null);
 *
 * <FilterDropdown
 *   isOpen={isFiltersOpen}
 *   onClose={() => setIsFiltersOpen(false)}
 *   triggerRef={filterButtonRef}
 *   data={tableData}
 *   filterConfigs={[
 *     { columnKey: 'estado', label: 'Estado' },
 *   ]}
 *   selectedFilters={filters}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleResetFilters}
 * />
 * ```
 *
 * @example
 * // Uso con opciones predefinidas del backend
 * ```tsx
 * <FilterDropdown
 *   isOpen={isFiltersOpen}
 *   onClose={() => setIsFiltersOpen(false)}
 *   triggerRef={filterButtonRef}
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
 *         { value: 'PAUSADO', label: 'Pausado' }
 *       ]
 *     },
 *     {
 *       columnKey: 'activeOnly',
 *       label: 'Solo activos',
 *       type: 'toggle'
 *     }
 *   ]}
 *   selectedFilters={filters}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleResetFilters}
 * />
 * ```
 */
export function FilterDropdown<T = any>({
  isOpen,
  onClose,
  triggerRef,
  className = '',
  onFilterChange,
  onReset,
  ...filterPanelProps
}: FilterDropdownProps<T>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calcular y ajustar posición basada en el botón trigger
  // El menú siempre se posiciona debajo del botón
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    const calculateAndAdjustPosition = () => {
      if (!dropdownRef.current || !triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 10; // Padding mínimo desde los bordes
      const gap = 4; // Espacio entre el botón y el menú

      // Posición horizontal: alineado a la derecha del botón
      let x = triggerRect.right - dropdownRect.width;

      // Si el menú es más ancho que el botón, alinear a la izquierda del botón
      if (dropdownRect.width > triggerRect.width) {
        x = triggerRect.left;
      }

      // Ajustar si se sale por la derecha
      if (x + dropdownRect.width > viewportWidth - padding) {
        x = viewportWidth - dropdownRect.width - padding;
      }

      // Ajustar si se sale por la izquierda
      if (x < padding) {
        x = padding;
      }

      // Posición vertical: siempre debajo del botón
      let y = triggerRect.bottom + gap;

      // Ajustar verticalmente si se sale por abajo
      if (y + dropdownRect.height > viewportHeight - padding) {
        // Si no cabe abajo, posicionar arriba del botón
        y = triggerRect.top - dropdownRect.height - gap;

        // Si tampoco cabe arriba, alinear al borde inferior
        if (y < padding) {
          y = viewportHeight - dropdownRect.height - padding;
        }
      }

      // Ajustar si se sale por arriba (solo si se movió arriba)
      if (y < padding) {
        y = padding;
      }

      setPosition({ x, y });
    };

    // Primero establecer posición inicial estimada
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const estimatedWidth = 320;
    const estimatedHeight = 200;
    const padding = 10;
    const gap = 4;

    // Posición horizontal: alineado a la derecha del botón
    let initialX = triggerRect.right - estimatedWidth;

    // Si el menú es más ancho que el botón, alinear a la izquierda del botón
    if (estimatedWidth > triggerRect.width) {
      initialX = triggerRect.left;
    }

    // Ajuste horizontal inicial
    if (initialX + estimatedWidth > window.innerWidth - padding) {
      initialX = window.innerWidth - estimatedWidth - padding;
    }
    if (initialX < padding) {
      initialX = padding;
    }

    // Posición vertical: siempre debajo del botón
    let initialY = triggerRect.bottom + gap;

    // Ajuste vertical inicial
    if (initialY + estimatedHeight > window.innerHeight - padding) {
      initialY = triggerRect.top - estimatedHeight - gap;
      if (initialY < padding) {
        initialY = window.innerHeight - estimatedHeight - padding;
      }
    }

    setPosition({ x: initialX, y: initialY });

    // Ajustar con el tamaño real después del render
    requestAnimationFrame(() => {
      calculateAndAdjustPosition();
    });
  }, [isOpen, triggerRef]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Cerrar con ESC
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`fixed rounded-lg shadow-lg ${className}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: 10000,
        backgroundColor: 'var(--color-component-bg)',
        border: '1px solid var(--color-gray-1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <FilterPanel
        {...filterPanelProps}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    </div>
  );
}
