import { useEffect, useRef } from 'react';

export interface DropdownMenuItem {
  /** Etiqueta del item */
  label: string;
  /** Callback cuando se hace click en el item */
  onClick: () => void;
  /** Si el item está deshabilitado */
  disabled?: boolean;
  /** Si el item es un separador (solo muestra una línea) */
  separator?: boolean;
  /** Color del texto (danger para acciones destructivas) */
  variant?: 'default' | 'danger';
}

export interface DropdownMenuProps {
  /** Items del menú */
  items: DropdownMenuItem[];
  /** Si el menú está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el menú */
  onClose: () => void;
  /** Posición del menú */
  position?: {
    x: number;
    y: number;
  };
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente de menú desplegable con soporte para modo claro y oscuro
 * 
 * @example
 * ```tsx
 * // Menú básico
 * <DropdownMenu
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   position={{ x: 100, y: 200 }}
 *   items={[
 *     { label: 'Editar', onClick: () => handleEdit() },
 *     { label: 'Borrar', onClick: () => handleDelete(), variant: 'danger' },
 *     { separator: true },
 *     { label: 'Pausar', onClick: () => handlePause() },
 *     { label: 'Cancelar', onClick: () => handleCancel() },
 *   ]}
 * />
 * ```
 */
export function DropdownMenu({
  items,
  isOpen,
  onClose,
  position,
  className = '',
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Cerrar menú con ESC
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Ajustar posición si el menú se sale de la pantalla
  useEffect(() => {
    if (isOpen && menuRef.current && position) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Ajustar horizontalmente
      if (rect.right > viewportWidth) {
        menu.style.left = `${viewportWidth - rect.width - 10}px`;
      }
      if (rect.left < 0) {
        menu.style.left = '10px';
      }

      // Ajustar verticalmente
      if (rect.bottom > viewportHeight) {
        menu.style.top = `${viewportHeight - rect.height - 10}px`;
      }
      if (rect.top < 0) {
        menu.style.top = '10px';
      }
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-10000
        min-w-[160px]
        rounded-lg
        shadow-lg
        py-1
        ${className}
      `}
      style={{
        left: position?.x ? `${position.x}px` : 'auto',
        top: position?.y ? `${position.y}px` : 'auto',
        backgroundColor: 'var(--color-component-bg)',
        border: '1px solid var(--color-gray-1)',
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="h-px my-1"
              style={{
                backgroundColor: 'var(--color-gray-1)',
              }}
            />
          );
        }

        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-4 py-2 text-left text-sm
              transition-colors duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                item.variant === 'danger'
                  ? 'text-(--color-error-typo) hover:bg-(--color-error-typo)/10'
                  : 'text-(--color-base-primary-typo) hover:bg-gray-2-light dark:hover:bg-gray-3-dark'
              }
            `}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
