import { ReactNode } from 'react';
import { Modal } from '../Modal/Modal';

export interface DetailField<T = any> {
  /** Clave del campo en el objeto de datos */
  key: string;
  /** Etiqueta a mostrar */
  label: string;
  /** Función personalizada para renderizar el valor */
  render?: (value: any, row: T) => ReactNode;
  /** Si el campo debe mostrarse en una línea separada (por defecto false) */
  fullWidth?: boolean;
  /** Si es true, este campo actúa como un separador visual */
  isSeparator?: boolean;
}

export interface DetailModalProps<T = any> {
  /** Título del modal */
  title: string;
  /** Datos de la fila a mostrar */
  data: T | null;
  /** Campos a mostrar en el modal */
  fields: DetailField<T>[];
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Ancho máximo del modal */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente modal para mostrar los detalles de una fila de tabla
 *
 * Este componente permite mostrar los datos de una fila de forma estructurada
 * con etiquetas y valores, con soporte para renderizado personalizado.
 *
 * @example
 * ```tsx
 * // Uso básico
 * <DetailModal
 *   title="Detalles de la opción"
 *   data={selectedRow}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fields={[
 *     { key: 'nombre', label: 'Nombre' },
 *     { key: 'descripcion', label: 'Descripción', fullWidth: true },
 *     {
 *       key: 'estado',
 *       label: 'Estado',
 *       render: (value) => (
 *         <span className={value === 'active' ? 'text-green' : 'text-gray'}>
 *           {value === 'active' ? 'Activo' : 'Inactivo'}
 *         </span>
 *       )
 *     },
 *   ]}
 * />
 *
 * // Con campos anidados
 * <DetailModal
 *   title="Detalles del usuario"
 *   data={selectedRow}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fields={[
 *     { key: 'nombre', label: 'Nombre' },
 *     { key: 'usuario.email', label: 'Email' },
 *     { key: 'usuario.telefono', label: 'Teléfono' },
 *   ]}
 * />
 * ```
 */
export function DetailModal<T = any>({
  title,
  data,
  fields,
  isOpen,
  onClose,
  maxWidth = 'md',
  className = '',
}: DetailModalProps<T>) {
  // Función helper para obtener valores anidados (ej: "usuario.email")
  const getNestedValue = (obj: any, path: string): any => {
    const keys = path.split('.');
    let value: any = obj;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    return value;
  };

  if (!data) return null;

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {fields.map((field) => {
          const value = getNestedValue(data, field.key);
          const displayValue = field.render
            ? field.render(value, data)
            : value ?? '—';

          return (
            <div key={field.key} className={field.fullWidth ? 'w-full' : ''}>
              <div
                className="text-sm font-medium mb-1"
                style={{
                  color: 'var(--color-base-secondary-typo)',
                }}
              >
                {field.label}
              </div>
              <div
                className="text-base"
                style={{
                  color: 'var(--color-base-primary-typo)',
                }}
              >
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
