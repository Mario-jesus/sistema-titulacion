import { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Título de la página/sección */
  title: string;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Valor del campo de búsqueda */
  searchValue?: string;
  /** Callback cuando cambia el valor de búsqueda */
  onSearchChange?: (value: string) => void;
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
  };
  /** Clase CSS adicional */
  className?: string;
}
