import { InputHTMLAttributes, forwardRef } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const SearchIcon = ({ className = '', size = 20 }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ fill: 'currentColor' }}
  >
    <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
  </svg>
);

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Clase CSS adicional */
  className?: string;
  /** Ancho completo */
  fullWidth?: boolean;
}

/**
 * Componente de búsqueda con icono de lupa y soporte para modo claro y oscuro
 * 
 * @example
 * ```
 * <Search
 *   placeholder="Buscar alumno"
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 * />
 * ```
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const containerClasses = [
      'relative flex items-center',
      fullWidth && 'w-full',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'w-full',
      'pl-10 pr-4 py-1.5',
      'text-base',
      'font-inherit',
      'text-[var(--color-base-primary-typo)]',
      'bg-[var(--color-input-bg)]',
      'border border-[var(--color-input-border)]',
      'rounded-lg',
      'outline-none',
      'placeholder:text-[var(--color-base-secondary-typo)]',
      'focus:border-[var(--color-primary-color)]',
      'focus:ring-2 focus:ring-[var(--color-primary-color)] focus:ring-opacity-10',
      'disabled:bg-[var(--color-gray-2)]',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconClasses = 'absolute left-3 text-[var(--color-primary-color)] pointer-events-none';

    return (
      <div className={containerClasses}>
        <SearchIcon className={iconClasses} size={20} />
        <input
          ref={ref}
          type="search"
          className={inputClasses}
          {...props}
        />
      </div>
    );
  }
);

Search.displayName = 'Search';
