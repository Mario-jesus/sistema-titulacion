import { DropdownMenuItem } from '../DropdownMenu/DropdownMenu';

/**
 * Configuración de transiciones de estado para una fila
 */
export interface StatusTransitionConfig<T = any> {
  /** Estado actual de la fila */
  currentStatus: string;
  /** Función para obtener el estado actual de una fila */
  getStatus: (row: T) => string;
  /** Mapeo de estados a acciones disponibles */
  transitions: {
    [status: string]: {
      /** Acciones disponibles desde este estado */
      actions: Array<{
        /** Etiqueta de la acción */
        label: string;
        /** Nuevo estado al ejecutar la acción */
        targetStatus: string;
        /** Callback cuando se ejecuta la acción */
        onClick: (row: T) => void;
        /** Si la acción es destructiva (aparece en rojo) */
        variant?: 'danger';
      }>;
      /** Acciones adicionales que siempre están disponibles (como Editar, Borrar) */
      additionalActions?: Array<{
        label: string;
        onClick: (row: T) => void;
        variant?: 'danger';
      }>;
      /** Si se debe mostrar un separador antes de las acciones adicionales */
      showSeparator?: boolean;
    };
  };
}

/**
 * Crea las acciones del menú desplegable basadas en las transiciones de estado configuradas
 *
 * @example
 * ```tsx
 * // Ejemplo 1: Estados activo, pausado, cancelado
 * const actions = createStatusActions(row, {
 *   currentStatus: row.estado,
 *   getStatus: (row) => row.estado,
 *   transitions: {
 *     active: {
 *       additionalActions: [
 *         { label: 'Editar', onClick: () => handleEdit(row) },
 *         { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' },
 *       ],
 *       actions: [
 *         { label: 'Pausar', targetStatus: 'paused', onClick: () => handlePause(row) },
 *         { label: 'Cancelar', targetStatus: 'cancelled', onClick: () => handleCancel(row), variant: 'danger' },
 *       ],
 *       showSeparator: true,
 *     },
 *     paused: {
 *       additionalActions: [
 *         { label: 'Editar', onClick: () => handleEdit(row) },
 *         { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' },
 *       ],
 *       actions: [
 *         { label: 'Activar', targetStatus: 'active', onClick: () => handleActivate(row) },
 *         { label: 'Cancelar', targetStatus: 'cancelled', onClick: () => handleCancel(row), variant: 'danger' },
 *       ],
 *       showSeparator: true,
 *     },
 *     cancelled: {
 *       additionalActions: [
 *         { label: 'Editar', onClick: () => handleEdit(row) },
 *         { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' },
 *       ],
 *       actions: [], // No hay transiciones desde cancelado
 *     },
 *   },
 * });
 *
 * // Ejemplo 2: Estados activo, inactivo (más simple)
 * const actions = createStatusActions(row, {
 *   currentStatus: row.activo ? 'activo' : 'inactivo',
 *   getStatus: (row) => row.activo ? 'activo' : 'inactivo',
 *   transitions: {
 *     activo: {
 *       additionalActions: [
 *         { label: 'Editar', onClick: () => handleEdit(row) },
 *       ],
 *       actions: [
 *         { label: 'Inactivar', targetStatus: 'inactivo', onClick: () => handleDeactivate(row) },
 *       ],
 *     },
 *     inactivo: {
 *       additionalActions: [
 *         { label: 'Editar', onClick: () => handleEdit(row) },
 *       ],
 *       actions: [
 *         { label: 'Activar', targetStatus: 'activo', onClick: () => handleActivate(row) },
 *       ],
 *     },
 *   },
 * });
 * ```
 */
export function createStatusActions<T = any>(
  row: T,
  config: StatusTransitionConfig<T>
): DropdownMenuItem[] {
  const currentStatus = config.getStatus(row);
  const transition = config.transitions[currentStatus];

  if (!transition) {
    return [];
  }

  const items: DropdownMenuItem[] = [];

  // Agregar acciones adicionales primero (Editar, Borrar, etc.)
  if (transition.additionalActions && transition.additionalActions.length > 0) {
    transition.additionalActions.forEach((action) => {
      items.push({
        label: action.label,
        onClick: () => action.onClick(row),
        variant: action.variant,
      });
    });
  }

  // Agregar separador si hay acciones de transición y se requiere
  if (transition.actions.length > 0) {
    if (
      transition.showSeparator &&
      transition.additionalActions &&
      transition.additionalActions.length > 0
    ) {
      items.push({
        separator: true,
        label: 'separator',
        onClick: () => {},
      });
    }

    // Agregar acciones de transición de estado después
    transition.actions.forEach((action) => {
      items.push({
        label: action.label,
        onClick: () => action.onClick(row),
        variant: action.variant,
      });
    });
  }

  return items;
}
