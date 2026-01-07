import { Search, Button } from '@shared/ui';
import { PageHeaderProps } from '../model/types';
import { ChevronDownIcon, PlusIcon } from './icons';

/**
 * Componente de header de página con título, búsqueda, acciones y filtros
 * 
 * Este componente proporciona una estructura consistente para los headers de las páginas,
 * incluyendo título, campo de búsqueda, botón de acción principal y filtros.
 * Soporta modo claro y oscuro automáticamente usando las variables CSS del sistema.
 * 
 * @example
 * ```tsx
 * // Uso básico con título y búsqueda
 * <PageHeader
 *   title="Opciones de titulación"
 *   searchPlaceholder="Buscar alumno"
 *   searchValue={searchTerm}
 *   onSearchChange={(value) => setSearchTerm(value)}
 * />
 * 
 * // Con acción principal (botón Añadir)
 * <PageHeader
 *   title="Opciones de titulación"
 *   primaryAction={{
 *     label: 'Añadir',
 *     onClick: () => handleAdd(),
 *     isLoading: false
 *   }}
 * />
 * 
 * // Con filtros
 * <PageHeader
 *   title="Opciones de titulación"
 *   filters={{
 *     label: 'Filtros',
 *     onClick: () => handleFilters(),
 *     isActive: hasActiveFilters
 *   }}
 * />
 * 
 * // Uso completo con todas las opciones
 * <PageHeader
 *   title="Opciones de titulación"
 *   searchPlaceholder="Buscar alumno"
 *   searchValue={searchTerm}
 *   onSearchChange={(value) => setSearchTerm(value)}
 *   primaryAction={{
 *     label: 'Añadir',
 *     onClick: () => handleAdd(),
 *     isLoading: isAdding
 *   }}
 *   filters={{
 *     label: 'Filtros',
 *     onClick: () => handleFilters(),
 *     isActive: hasActiveFilters
 *   }}
 * />
 * ```
 */
export function PageHeader({
  title,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  primaryAction,
  filters,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      {/* Primera fila: Título y acción principal */}
      <div className="flex items-center justify-between gap-4 w-full">
        <h2
          className="text-xl font-semibold shrink-0"
          style={{
            color: 'var(--color-base-primary-typo)',
          }}
        >
          {title}
        </h2>

        {primaryAction && (
          <Button
            variant="outline"
            size='small'
            onClick={primaryAction.onClick}
            isLoading={primaryAction.isLoading}
            className="shrink-0"
          >
            {primaryAction.icon ? (
              <span className="mr-2">{primaryAction.icon}</span>
            ) : (
              <PlusIcon size={16} className="mr-2" />
            )}
            {primaryAction.label}
          </Button>
        )}
      </div>

      {/* Separador */}
      <div className="h-px w-full bg-gray-3-light dark:bg-gray-6-dark"/>

      {/* Segunda fila: Búsqueda y filtros */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="max-w-2xs w-full">
          <Search
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            fullWidth
          />
        </div>

        {filters && (
          <Button
            variant="ghost"
            size='small'
            onClick={filters.onClick}
            className="shrink-0"
          >
            <span>{filters.label || 'Filtros'}</span>
            <ChevronDownIcon size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
