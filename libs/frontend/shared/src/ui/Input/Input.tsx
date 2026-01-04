import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Clases del contenedor
    const containerClasses = [
      'flex flex-col gap-2',
      fullWidth && 'w-full',
    ]
      .filter(Boolean)
      .join(' ');

    // Clases del label (soporta modo oscuro automáticamente)
    const labelClasses = 'text-sm font-medium text-[var(--color-base-primary-typo)] m-0';

    // Clases del input base (soporta modo oscuro automáticamente)
    const inputBaseClasses = [
      'px-4 py-3',
      'text-base',
      'font-inherit',
      'text-[var(--color-base-primary-typo)]',
      'bg-[var(--color-input-bg)]',
      'border border-[var(--color-input-border)]',
      'rounded-lg',
      'outline-none',
      'transition-all duration-200',
      'w-full',
      'placeholder:text-[var(--color-base-secondary-typo)]',
      'focus:border-[var(--color-primary-color)]',
      'focus:ring-2 focus:ring-[var(--color-primary-color)] focus:ring-opacity-10',
      'disabled:bg-[var(--color-gray-2)]',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
      error && 'border-[var(--color-error-typo)]',
      error && 'focus:border-[var(--color-error-typo)]',
      error && 'focus:ring-2 focus:ring-[var(--color-error-typo)] focus:ring-opacity-10',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Clases del mensaje de error (soporta modo oscuro automáticamente)
    const errorClasses = 'text-sm text-[var(--color-error-typo)] -mt-1';

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputBaseClasses}
          {...props}
        />
        {error && (
          <span className={errorClasses}>{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
