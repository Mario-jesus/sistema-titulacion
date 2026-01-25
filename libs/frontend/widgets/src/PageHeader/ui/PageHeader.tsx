import { Search, Button } from '@shared/ui';
import { PageHeaderProps } from '../model/types';
import { FilterIcon, PlusIcon } from './icons';

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
 *   // onSearchClear es opcional, por defecto limpia el valor
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
 * // Con acción de exportación
 * <PageHeader
 *   title="Reportes"
 *   exportAction={{
 *     label: 'Exportar a Excel',
 *     onClick: () => handleExport(),
 *     isLoading: isExporting,
 *     disabled: !hasData
 *   }}
 * />
 *
 * // Uso completo con todas las opciones
 * <PageHeader
 *   title="Opciones de titulación"
 *   searchPlaceholder="Buscar alumno"
 *   searchValue={searchTerm}
 *   onSearchChange={(value) => setSearchTerm(value)}
 *   onSearchClear={() => {
 *     setSearchTerm('');
 *     // Opcional: limpiar otros estados relacionados
 *   }}
 *   primaryAction={{
 *     label: 'Añadir',
 *     onClick: () => handleAdd(),
 *     isLoading: isAdding
 *   }}
 *   exportAction={{
 *     label: 'Exportar a Excel',
 *     onClick: () => handleExport(),
 *     isLoading: isExporting
 *   }}
 *   filters={{
 *     label: 'Filtros',
 *     onClick: () => handleFilters(),
 *     isActive: hasActiveFilters
 *   }}
 * />
 * ```
 *
 * **Nota sobre búsqueda con API**: La búsqueda se ejecuta solo cuando el usuario presiona Enter
 * (usando el callback `onSearch`). El `onSearchChange` solo actualiza el valor local.
 * El botón de limpiar aparece automáticamente cuando hay texto en el campo de búsqueda.
 */
export function PageHeader({
  title,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  onSearch,
  onSearchClear,
  primaryAction,
  filters,
  exportAction,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 md:gap-4 w-full ${className}`}>
      {/* Primera fila: Título y acciones */}
      <div className="flex items-center justify-between gap-2 md:gap-4 w-full min-w-0">
        <h2
          className="text-lg md:text-xl font-semibold min-w-0 flex-1 truncate"
          style={{
            color: 'var(--color-base-primary-typo)',
          }}
        >
          {title}
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          {exportAction && (
            <Button
              variant="secondary"
              size="small"
              onClick={exportAction.onClick}
              isLoading={exportAction.isLoading}
              disabled={exportAction.disabled}
            >
              {exportAction.label || 'Exportar a Excel'}
            </Button>
          )}

          {primaryAction && (
            <Button
              variant="outline"
              size="small"
              onClick={primaryAction.onClick}
              isLoading={primaryAction.isLoading}
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
      </div>

      {/* Separador */}
      <div className="h-px w-full bg-gray-3-light dark:bg-gray-6-dark" />

      {/* Segunda fila: Búsqueda y filtros */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="max-w-2xs w-full">
          <Search
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onSearch={onSearch}
            onClear={
              onSearchClear ||
              (() => {
                onSearchChange?.('');
                onSearch?.('');
              })
            }
            fullWidth
          />
        </div>

        {filters && (
          <Button
            ref={filters.buttonRef}
            variant="ghost"
            size="small"
            onClick={filters.onClick}
            className="shrink-0"
          >
            <FilterIcon size={16} className="mr-1" />
            <span>{filters.label || 'Filtros'}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
