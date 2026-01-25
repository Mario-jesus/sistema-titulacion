import { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Título de la página/sección */
  title: string;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Valor del campo de búsqueda */
  searchValue?: string;
  /** Callback cuando cambia el valor de búsqueda (solo actualiza el valor local) */
  onSearchChange?: (value: string) => void;
  /** Callback cuando se presiona Enter para ejecutar la búsqueda */
  onSearch?: (value: string) => void;
  /** Callback cuando se limpia la búsqueda (opcional, por defecto limpia el valor) */
  onSearchClear?: () => void;
  /** Acción principal (ej: botón "Añadir") */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    isLoading?: boolean;
  };
  /** Configuración de filtros */
  filters?: {
    label?: string;
    onClick: () => void;
    isActive?: boolean;
    /** Referencia al botón de filtros (para posicionar el dropdown) */
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
  };
  /** Acción de exportación (ej: botón "Exportar a Excel") */
  exportAction?: {
    label?: string;
    onClick: () => void | Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
  };
  /** Clase CSS adicional */
  className?: string;
}
