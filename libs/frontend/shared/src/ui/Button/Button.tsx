import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
}

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
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg border-none cursor-pointer transition-all duration-200 outline-none focus-visible:outline-2 focus-visible:outline-offset-2';

    // Clases de tamaño
    const sizeClasses = {
      small: 'px-4 py-2 text-sm min-h-[2rem]',
      medium: 'px-6 py-3 text-base min-h-[2.75rem]',
      large: 'px-8 py-4 text-lg min-h-[3.5rem]',
    };

    // Clases de variante usando variables CSS de la paleta (soportan modo oscuro automáticamente)
    const variantClasses = {
      primary: [
        'bg-[var(--color-primary-color)]',
        'text-[var(--color-white)]',
        'hover:opacity-90',
        'active:opacity-80',
        'focus-visible:outline-[var(--color-primary-color)]',
      ].join(' '),
      secondary: [
        'bg-[var(--color-gray-2)]',
        'text-[var(--color-base-primary-typo)]',
        'hover:bg-[var(--color-gray-3)]',
        'active:bg-[var(--color-gray-3)]',
        'focus-visible:outline-[var(--color-primary-color)]',
      ].join(' '),
      ghost: [
        'bg-transparent',
        'text-[var(--color-base-secondary-typo)]',
        'hover:bg-[var(--color-gray-2)]',
        'active:bg-[var(--color-gray-2)]',
        'focus-visible:outline-[var(--color-primary-color)]',
      ].join(' '),
    };

    const classNames = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth && 'w-full',
      (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
      isLoading && 'relative text-transparent',
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
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-current">
            Cargando...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
