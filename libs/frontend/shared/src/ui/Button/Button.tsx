import { ButtonHTMLAttributes, forwardRef } from 'react';

interface SpinnerProps {
  className?: string;
  size?: number;
}

const Spinner = ({ className = '', size = 20 }: SpinnerProps) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ fill: 'none' }}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
}

/**
 * Componente de botón con soporte para modo claro y oscuro
 * 
 * @example
 * ```tsx
 * // Botón primario (por defecto)
 * <Button variant="primary" onClick={() => console.log('Click')}>
 *   Guardar
 * </Button>
 * 
 * // Botón outline
 * <Button variant="outline" onClick={() => console.log('Click')}>
 *   Añadir
 * </Button>
 * 
 * // Botón secundario
 * <Button variant="secondary" onClick={() => console.log('Click')}>
 *   Cancelar
 * </Button>
 * 
 * // Botón ghost
 * <Button variant="ghost" onClick={() => console.log('Click')}>
 *   Ver más
 * </Button>
 * 
 * // Botón con diferentes tamaños
 * <Button size="small">Pequeño</Button>
 * <Button size="medium">Mediano</Button>
 * <Button size="large">Grande</Button>
 * 
 * // Botón con estado de carga
 * <Button isLoading>Cargando...</Button>
 * 
 * // Botón de ancho completo
 * <Button fullWidth>Ancho completo</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Clases base comunes a todos los botones
    const baseClasses = `inline-flex items-center justify-center font-medium rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${
      isLoading || disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    }`;

    // Clases de tamaño
    const sizeClasses = {
      small: 'px-4 py-2 text-sm min-h-[2rem]',
      medium: 'px-6 py-3 text-base min-h-[2.75rem]',
      large: 'px-8 py-4 text-lg min-h-[3.5rem]',
    };

    // Clases de variante usando variables CSS de la paleta (soportan modo oscuro automáticamente)
    // Desactivar hover y active cuando está cargando o deshabilitado
    const isInteractive = !isLoading && !disabled;

    const variantClasses = {
      primary: [
        'border-none',
        'bg-(--color-primary-color)',
        'text-(--color-white)',
        isInteractive && 'hover:opacity-85',
        isInteractive && 'active:opacity-70',
        'focus-visible:outline-(--color-primary-color)',
      ].filter(Boolean).join(' '),
      secondary: [
        'border-none',
        'bg-(--color-gray-3)',
        'text-(--color-base-secondary-typo)',
        isInteractive && 'hover:bg-(--color-gray-3)/85',
        isInteractive && 'active:bg-(--color-gray-3)/70',
        'focus-visible:outline-(--color-primary-color)',
      ].filter(Boolean).join(' '),
      ghost: [
        'border-none',
        'bg-transparent',
        'text-(--color-base-secondary-typo)',
        isInteractive && 'hover:bg-(--color-gray-3)/85',
        isInteractive && 'active:bg-(--color-gray-3)/60',
        'focus-visible:outline-(--color-primary-color)',
      ].filter(Boolean).join(' '),
      outline: [
        'border border-(--color-primary-color)',
        'bg-transparent',
        'text-(--color-primary-color)',
        isInteractive && 'hover:bg-(--color-primary-color)',
        isInteractive && 'hover:text-(--color-white)',
        isInteractive && 'active:bg-(--color-primary-color)',
        isInteractive && 'active:text-(--color-white)',
        isInteractive && 'active:opacity-80',
        'focus-visible:outline-(--color-primary-color)',
      ].filter(Boolean).join(' '),
    };

    // Determinar el color del spinner según la variante
    const spinnerColor = variant === 'primary' || (variant === 'outline' && isLoading)
      ? 'text-(--color-white)' 
      : 'text-(--color-base-primary-typo)';

    // Tamaño del spinner según el tamaño del botón
    const spinnerSize = {
      small: 16,
      medium: 20,
      large: 24,
    };

    const classNames = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth && 'w-full',
      (disabled || isLoading) && 'opacity-50 pointer-events-none',
      isLoading && 'relative',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="invisible">{children}</span>
            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${spinnerColor}`}>
              <Spinner size={spinnerSize[size]} />
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
