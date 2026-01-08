import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface IconProps {
  className?: string;
  size?: number;
}

const CloseIcon = ({ className = '', size = 24 }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ fill: 'currentColor' }}
  >
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
  </svg>
);

export interface ModalProps {
  /** Título del modal */
  title: string;
  /** Contenido del modal (formulario, etc.) */
  children: ReactNode;
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Ancho máximo del modal */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Clase CSS adicional para el contenedor del modal */
  className?: string;
}

/**
 * Componente de modal genérico con soporte para modo claro y oscuro
 * 
 * @example
 * ```tsx
 * // Modal básico
 * <Modal
 *   title="Añadir opción de titulación"
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <form>
 *     {/* Formulario aquí *\/}
 *   </form>
 * </Modal>
 * 
 * // Modal con ancho personalizado
 * <Modal
 *   title="Editar usuario"
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   maxWidth="lg"
 * >
 *   <form>
 *     {/* Formulario aquí *\/}
 *   </form>
 * </Modal>
 * ```
 */
export function Modal({
  title,
  children,
  isOpen,
  onClose,
  maxWidth = 'md',
  className = '',
}: ModalProps) {
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      {/* Contenedor del modal */}
      <div
        className={`
          relative w-full ${maxWidthClasses[maxWidth]}
          rounded-lg shadow-2xl
          flex flex-col
          max-h-[90vh]
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-component-bg)',
        }}
      >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-3-light dark:border-gray-6-dark rounded-t-lg shrink-0"
          >
            <h2
              className="text-xl font-semibold"
              style={{
                color: 'var(--color-base-primary-typo)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center p-2 rounded-lg cursor-pointer bg-transparent hover:bg-gray-2-light dark:hover:bg-gray-3-dark"
              style={{
                color: 'var(--color-base-secondary-typo)',
              }}
              aria-label="Cerrar modal"
              type="button"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
            {children}
          </div>
        </div>
    </div>
  );

  // Renderizar el modal en un portal directamente en el body
  return createPortal(modalContent, document.body);
}
