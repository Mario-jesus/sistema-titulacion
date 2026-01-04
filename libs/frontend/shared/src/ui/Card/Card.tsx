import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'elevated',
      padding = 'medium',
      className = '',
      ...props
    },
    ref
  ) => {
    // Clases base comunes
    const baseClasses = 'rounded-xl transition-shadow duration-200';

    // Clases de variante
    const variantClasses = {
      elevated: [
        'bg-[var(--color-component-bg)]',
        'shadow-sm',
        'hover:shadow-md',
      ].join(' '),
      outlined: [
        'bg-[var(--color-component-bg)]',
        'border border-[var(--color-gray-1)]',
        'shadow-none',
      ].join(' '),
      flat: [
        'bg-[var(--color-component-bg)]',
        'shadow-none',
      ].join(' '),
    };

    // Clases de padding
    const paddingClasses = {
      none: 'p-0',
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
    };

    const classNames = [
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
