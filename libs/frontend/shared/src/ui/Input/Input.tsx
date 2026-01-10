import { InputHTMLAttributes, forwardRef, useEffect } from 'react';

export type InputVariant = 'default' | 'calendar' | 'year';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  /** Variante del input: 'default', 'calendar' (para fechas), 'year' (para años sin spinners) */
  variant?: InputVariant;
}

/**
 * Componente de input con soporte para modo claro y oscuro
 *
 * Este componente proporciona un campo de entrada de texto con label opcional,
 * manejo de errores y soporte automático para modo claro y oscuro usando las
 * variables CSS del sistema.
 *
 * @example
 * ```tsx
 * // Input básico
 * <Input
 *   placeholder="Ingresa tu nombre"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * // Input con label
 * <Input
 *   label="Nombre"
 *   placeholder="Ingresa tu nombre"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 *
 * // Input con error
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error="El email es requerido"
 * />
 *
 * // Input de ancho completo
 * <Input
 *   label="Descripción"
 *   fullWidth
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 * />
 *
 * // Input deshabilitado
 * <Input
 *   label="Campo deshabilitado"
 *   value="Valor fijo"
 *   disabled
 * />
 *
 * // Input de tipo año (sin spinners)
 * <Input
 *   label="Año"
 *   type="number"
 *   variant="year"
 *   placeholder="2024"
 *   value={year}
 *   onChange={(e) => setYear(e.target.value)}
 *   min="1900"
 *   max="2100"
 * />
 *
 * // Input de tipo calendario/fecha
 * <Input
 *   label="Fecha"
 *   variant="calendar"
 *   value={date}
 *   onChange={(e) => setDate(e.target.value)}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, variant = 'default', className = '', id, type, style, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determinar el tipo de input según la variante
    let inputType = type;
    if (variant === 'calendar' && !type) {
      inputType = 'date';
    } else if (variant === 'year' && !type) {
      inputType = 'number';
    }

    // Inyectar estilos globales para ocultar spinners en inputs de año (solo una vez)
    useEffect(() => {
      if (variant === 'year') {
        const styleId = 'input-year-no-spinners-style';
        if (!document.getElementById(styleId)) {
          const styleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.textContent = `
            input[type="number"].input-year-no-spinners::-webkit-inner-spin-button,
            input[type="number"].input-year-no-spinners::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `;
          document.head.appendChild(styleElement);
        }
      }
    }, [variant]);

    // Clases del contenedor
    const containerClasses = ['flex flex-col gap-2', fullWidth && 'w-full']
      .filter(Boolean)
      .join(' ');

    // Clases del label (soporta modo oscuro automáticamente)
    const labelClasses =
      'text-sm font-medium text-[var(--color-base-primary-typo)] m-0';

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
      'w-full',
      'placeholder:text-[var(--color-base-secondary-typo)]',
      'focus:border-[var(--color-primary-color)]',
      'focus:ring-2 focus:ring-[var(--color-primary-color)] focus:ring-opacity-10',
      'disabled:bg-[var(--color-gray-2)]',
      'disabled:cursor-not-allowed',
      'disabled:opacity-60',
      error && 'border-[var(--color-error-typo)]',
      error && 'focus:border-[var(--color-error-typo)]',
      error &&
        'focus:ring-2 focus:ring-[var(--color-error-typo)] focus:ring-opacity-10',
      variant === 'year' && 'input-year-no-spinners',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Estilos inline para variantes especiales
    const inputStyle: React.CSSProperties = {
      ...style,
      ...(variant === 'year' && {
        // Ocultar spinners en navegadores webkit
        MozAppearance: 'textfield' as const,
        appearance: 'textfield' as const,
      }),
    };

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
          type={inputType}
          className={inputBaseClasses}
          style={inputStyle}
          {...props}
        />
        {error && <span className={errorClasses}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
