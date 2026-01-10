import {
  InputHTMLAttributes,
  forwardRef,
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
} from 'react';

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

const ClearIcon = ({ className = '', size = 20 }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ fill: 'currentColor' }}
  >
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.207 12.793-1.414 1.414L12 13.414l-2.793 2.793-1.414-1.414L10.586 12 7.793 9.207l1.414-1.414L12 10.586l2.793-2.793 1.414 1.414L13.414 12l2.793 2.793z"></path>
  </svg>
);

export interface SearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onKeyDown'> {
  /** Clase CSS adicional */
  className?: string;
  /** Ancho completo */
  fullWidth?: boolean;
  /** Callback cuando se hace click en el botón de limpiar */
  onClear?: () => void;
  /** Mostrar botón de limpiar cuando hay texto (default: true) */
  showClearButton?: boolean;
  /** Callback cuando se presiona Enter (ejecuta la búsqueda) */
  onSearch?: (value: string) => void;
  /** Callback cuando se presiona una tecla */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Componente de búsqueda con icono de lupa, botón de limpiar y soporte para modo claro y oscuro
 *
 * La búsqueda se ejecuta solo cuando el usuario presiona Enter (callback `onSearch`).
 * El `onChange` solo actualiza el valor local sin disparar búsquedas al backend.
 *
 * El botón de limpiar nativo del navegador está desactivado, se usa solo el botón personalizado.
 *
 * @example
 * // Uso básico con datos locales (búsqueda inmediata)
 * ```tsx
 * <Search
 *   placeholder="Buscar alumno"
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   onSearch={(value) => {
 *     // Buscar inmediatamente
 *     performSearch(value);
 *   }}
 * />
 * ```
 *
 * @example
 * // Uso con backend (búsqueda solo al presionar Enter)
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const [searchQuery, setSearchQuery] = useState(''); // Valor que se envía al backend
 *
 * useEffect(() => {
 *   // Hacer petición a la API solo cuando cambia searchQuery
 *   fetchData({ search: searchQuery });
 * }, [searchQuery]);
 *
 * <Search
 *   placeholder="Buscar..."
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   onSearch={(value) => {
 *     // Solo se ejecuta al presionar Enter
 *     setSearchQuery(value);
 *   }}
 *   onClear={() => {
 *     setSearchTerm('');
 *     setSearchQuery(''); // Limpiar también la búsqueda activa
 *   }}
 * />
 * ```
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className = '',
      fullWidth = false,
      value,
      onClear,
      onSearch,
      onKeyDown,
      showClearButton = true,
      ...props
    },
    ref
  ) => {
    const hasValue =
      value !== undefined && value !== null && String(value).trim() !== '';
    const showClear =
      showClearButton && hasValue && (onClear || props.onChange);

    const containerClasses = [
      'relative flex items-center',
      fullWidth && 'w-full',
      'z-0', // Asegurar que está en el stacking context correcto
    ]
      .filter(Boolean)
      .join(' ');

    // CSS para ocultar el botón de limpiar nativo del navegador
    const inputClasses = [
      'w-full',
      'pl-10',
      showClear ? 'pr-10' : 'pr-4',
      'py-1.5',
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
      // Ocultar botón de limpiar nativo del navegador
      '[&::-webkit-search-cancel-button]:hidden',
      '[&::-webkit-search-decoration]:hidden',
      '[&::-ms-clear]:hidden',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconClasses =
      'absolute left-3 text-[var(--color-primary-color)] pointer-events-none';
    const clearButtonClasses = [
      'absolute right-3',
      'flex items-center justify-center',
      'w-5 h-5',
      'rounded-full',
      'cursor-pointer',
      'text-[var(--color-base-secondary-typo)]',
      'hover:text-[var(--color-base-primary-typo)]',
      'hover:bg-[var(--color-gray-1)]',
      'transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-color)] focus:ring-opacity-20',
    ]
      .filter(Boolean)
      .join(' ');

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (props.onChange) {
        // Crear un evento sintético para limpiar el valor
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as ChangeEvent<HTMLInputElement>;
        props.onChange(syntheticEvent);
      }
      // Si hay onSearch, también ejecutarlo con valor vacío para limpiar resultados
      if (onSearch) {
        onSearch('');
      }
    };

    // Inyectar estilos globales una sola vez para ocultar el botón de limpiar nativo
    // Estos estilos se aplican globalmente a todos los inputs type="search"
    useEffect(() => {
      const styleId = 'search-input-native-clear-hide';

      // Si ya existe, no hacer nada (puede haber múltiples instancias del componente)
      if (document.getElementById(styleId)) {
        return;
      }

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none !important;
          display: none !important;
          appearance: none !important;
        }
        input[type="search"]::-webkit-search-decoration {
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        input[type="search"]::-ms-clear {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        input[type="search"]::-ms-reveal {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `;
      document.head.appendChild(style);

      // No hacemos cleanup porque el estilo es global y puede ser usado por otros componentes
      // El estilo permanecerá en el DOM mientras la aplicación esté activa
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      // Ejecutar búsqueda al presionar Enter
      if (event.key === 'Enter' && onSearch) {
        event.preventDefault();
        event.stopPropagation();
        const searchValue =
          value !== undefined && value !== null ? String(value).trim() : '';
        onSearch(searchValue);
        return;
      }

      // Llamar al callback personalizado si existe
      if (onKeyDown) {
        onKeyDown(event);
      }
    };

    return (
      <div className={containerClasses}>
        <SearchIcon className={iconClasses} size={20} />
        <input
          ref={ref}
          type="search"
          className={inputClasses}
          value={value}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className={clearButtonClasses}
            aria-label="Limpiar búsqueda"
            tabIndex={0}
          >
            <ClearIcon size={16} />
          </button>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';
