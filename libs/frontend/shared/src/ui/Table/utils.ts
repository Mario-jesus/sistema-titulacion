import { SortDirection } from './Table';

/**
 * Obtiene el valor de una propiedad anidada usando notación de punto
 * @example getNestedValue({ user: { name: 'John' } }, 'user.name') // 'John'
 */
export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value: any = obj;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined || value === null) break;
  }
  return value;
}

/**
 * Compara dos valores para ordenamiento
 */
function compareValues(a: any, b: any): number {
  // Manejar null/undefined
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  // Comparar números
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Comparar fechas
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Comparar strings (case-insensitive)
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();
  
  if (aStr < bStr) return -1;
  if (aStr > bStr) return 1;
  return 0;
}

/**
 * Ordena un array de datos basándose en una columna y dirección
 * 
 * @param data - Array de datos a ordenar
 * @param columnKey - Clave de la columna (soporta notación de punto para valores anidados)
 * @param direction - Dirección del ordenamiento ('asc', 'desc', o null)
 * @returns Nuevo array ordenado (no muta el original)
 * 
 * @example
 * ```tsx
 * const sorted = sortTableData(data, 'nombre', 'asc');
 * const sortedNested = sortTableData(data, 'usuario.nombre', 'desc');
 * ```
 */
export function sortTableData<T = any>(
  data: T[],
  columnKey: string | null,
  direction: SortDirection
): T[] {
  if (!columnKey || !direction) {
    return [...data]; // Retornar copia sin ordenar
  }

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, columnKey);
    const bValue = getNestedValue(b, columnKey);

    const comparison = compareValues(aValue, bValue);

    return direction === 'asc' ? comparison : -comparison;
  });
}
