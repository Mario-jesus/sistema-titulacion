import { useMemo } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const ChevronLeftIcon = ({ className = '', size = 20 }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ fill: 'currentColor' }}
  >
    <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>
  </svg>
);

const ChevronRightIcon = ({ className = '', size = 20 }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ fill: 'currentColor' }}
  >
    <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
  </svg>
);

export interface PaginationProps {
  /** Página actual (1-indexed) */
  currentPage: number;
  /** Número total de páginas */
  totalPages: number;
  /** Callback cuando cambia la página */
  onPageChange: (page: number) => void;
  /** Número máximo de páginas visibles a cada lado de la página actual */
  siblingCount?: number;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente de paginación con soporte para modo claro y oscuro
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={68}
 *   onPageChange={(page) => console.log(page)}
 *   siblingCount={1}
 *   className="..."
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];

    // Calcular el rango ideal: siblingCount páginas a cada lado de la actual
    const idealLeft = currentPage - siblingCount;
    const idealRight = currentPage + siblingCount;

    // Calcular el rango real, ajustado a los límites
    let leftSiblingIndex = Math.max(idealLeft, 1);
    let rightSiblingIndex = Math.min(idealRight, totalPages);

    // Si el rango está limitado por el inicio, extender hacia la derecha
    if (leftSiblingIndex === 1 && idealLeft < 1) {
      const deficit = 1 - idealLeft; // Cuántas páginas faltan a la izquierda
      rightSiblingIndex = Math.min(rightSiblingIndex + deficit, totalPages);
    }

    // Si el rango está limitado por el final, extender hacia la izquierda
    if (rightSiblingIndex === totalPages && idealRight > totalPages) {
      const deficit = idealRight - totalPages; // Cuántas páginas faltan a la derecha
      leftSiblingIndex = Math.max(leftSiblingIndex - deficit, 1);
    }

    // Determinar si necesitamos mostrar ellipsis
    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    // Calcular el número total de páginas que se mostrarían
    const pagesInRange = rightSiblingIndex - leftSiblingIndex + 1;
    const totalVisiblePages = 1 + pagesInRange + 1; // primera + rango + última
    const ellipsisCount = (shouldShowLeftEllipsis ? 1 : 0) + (shouldShowRightEllipsis ? 1 : 0);
    const totalPagesToShow = totalVisiblePages + ellipsisCount;

    // Si el total de páginas es menor o igual a lo que queremos mostrar, mostrar todas
    if (totalPages <= totalPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Primera página siempre visible
    pages.push(1);

    // Ellipsis izquierdo si es necesario
    if (shouldShowLeftEllipsis) {
      pages.push('ellipsis');
    }

    // Páginas alrededor de la actual (incluyendo la actual)
    // Solo agregar páginas que no sean la primera ni la última (ya las agregamos arriba)
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Ellipsis derecho si es necesario
    if (shouldShowRightEllipsis) {
      pages.push('ellipsis');
    }

    // Última página siempre visible (si hay más de una página)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, siblingCount]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="Paginación"
    >
      {/* Botón Anterior */}
      <button
        onClick={handlePrevious}
        disabled={isFirstPage}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFirstPage
              ? 'text-(--color-base-secondary-typo) cursor-not-allowed'
              : 'cursor-pointer text-(--color-base-secondary-typo) hover:text-(--color-base-primary-typo) hover:bg-gray-2-light/80 dark:hover:bg-gray-3-dark/80 active:bg-gray-1-light/80 dark:active:bg-gray-5-dark/50'
          }
        `}
        aria-label="Página anterior"
        aria-disabled={isFirstPage}
      >
        <ChevronLeftIcon size={16} />
        <span>Anterior</span>
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-(--color-base-secondary-typo)"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`
                min-w-10 h-10 px-3 rounded-lg
                text-sm font-medium
                ${
                  isActive
                    ? 'bg-gray-2-light dark:bg-gray-3-dark text-(--color-base-primary-typo)'
                    : 'cursor-pointer text-(--color-base-secondary-typo) hover:text-(--color-base-primary-typo) hover:bg-gray-2-light/80 dark:hover:bg-gray-3-dark/80 active:bg-gray-3-light/80 dark:active:bg-gray-5-dark/50'
                }
              `}
              aria-label={`Ir a la página ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={handleNext}
        disabled={isLastPage}
        className={`
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isLastPage
              ? 'text-(--color-base-secondary-typo) cursor-not-allowed'
              : 'cursor-pointer text-(--color-base-secondary-typo) hover:text-(--color-base-primary-typo) hover:bg-gray-2-light/80 dark:hover:bg-gray-3-dark/80 active:bg-gray-3-light/80 dark:active:bg-gray-5-dark/50'
          }
        `}
        aria-label="Página siguiente"
        aria-disabled={isLastPage}
      >
        <span>Siguiente</span>
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  );
}
