import { HTMLAttributes, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        style={{ fill: 'var(--color-green)' }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
      </svg>
    ),
    bgColor: 'var(--color-green)',
    borderColor: 'var(--color-green)',
  },
  error: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        style={{ fill: 'var(--color-salmon)' }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
      </svg>
    ),
    bgColor: 'var(--color-salmon)',
    borderColor: 'var(--color-salmon)',
  },
  warning: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        style={{ fill: 'var(--color-yellow)' }}
      >
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
      </svg>
    ),
    bgColor: 'var(--color-yellow)',
    borderColor: 'var(--color-yellow)',
  },
  info: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        style={{ fill: 'var(--color-blue)' }}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
      </svg>
    ),
    bgColor: 'var(--color-blue)',
    borderColor: 'var(--color-blue)',
  },
};

export function Toast({
  id,
  type,
  message,
  title,
  duration = 5000,
  onClose,
  className = '',
  ...props
}: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, id, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[500px] transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--color-component-bg)',
        borderColor: config.borderColor,
        borderWidth: '1px',
        borderLeftWidth: '4px',
      }}
      {...props}
    >
      {/* Icon */}
      <div
        className="shrink-0 mt-0.5"
        style={{
          color: config.bgColor,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4
            className="m-0 mb-1 text-sm font-semibold"
            style={{
              color: 'var(--color-base-primary-typo)',
            }}
          >
            {title}
          </h4>
        )}
        <p
          className="m-0 text-sm"
          style={{
            color: 'var(--color-base-primary-typo)',
          }}
        >
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        className="shrink-0 ml-2 p-1 rounded transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{
          '--tw-ring-color': 'var(--color-primary-color)',
        } as React.CSSProperties & { '--tw-ring-color'?: string }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Cerrar"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          style={{
            fill: 'var(--color-base-secondary-typo)',
          }}
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </button>
    </div>
  );
}
