/**
 * Tipos genéricos reutilizables para toda la aplicación
 *
 * Estos tipos pueden ser usados por cualquier feature sin violar FSD,
 * ya que shared es una capa inferior accesible por todas las capas superiores.
 */

/**
 * Parámetros genéricos para paginación
 *
 * Usado en queries de listado para especificar paginación y ordenamiento
 *
 * @example
 * ```typescript
 * const params: PaginationParams = {
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * };
 * ```
 */
export interface PaginationParams {
  /** Número de página (1-indexed) */
  page?: number;
  /** Número de elementos por página */
  limit?: number;
  /** Campo por el cual ordenar */
  sortBy?: string;
  /** Dirección del ordenamiento */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Datos de paginación retornados por el backend
 *
 * Estructura estándar de paginación usada en todas las respuestas de listado
 *
 * @example
 * ```typescript
 * const response = await api.get('/items');
 * console.log(response.pagination.total); // Total de items
 * console.log(response.pagination.page); // Página actual
 * ```
 */
export interface PaginationData {
  /** Total de elementos en todos los resultados */
  total: number;
  /** Número de elementos por página */
  limit: number;
  /** Número total de páginas */
  totalPages: number;
  /** Página actual (1-indexed) */
  page: number;
  /** Contador de paginación (número del primer item de esta página) */
  pagingCounter: number;
  /** Si hay página anterior */
  hasPrevPage: boolean;
  /** Si hay página siguiente */
  hasNextPage: boolean;
  /** Número de página anterior (null si no hay) */
  prevPage: number | null;
  /** Número de página siguiente (null si no hay) */
  nextPage: number | null;
}

/**
 * Respuesta genérica de listado paginado
 *
 * Tipo genérico para respuestas de API que retornan listas paginadas
 *
 * @template T - Tipo de los elementos en la lista
 *
 * @example
 * ```typescript
 * interface Student {
 *   id: string;
 *   name: string;
 * }
 *
 * const response: ListResponse<Student> = await api.get('/students');
 * // response.data es Student[]
 * // response.pagination es PaginationData
 * ```
 */
export interface ListResponse<T> {
  /** Array de elementos de tipo T */
  data: T[];
  /** Información de paginación */
  pagination: PaginationData;
}

/**
 * Parámetros genéricos para búsqueda y filtrado
 *
 * Extiende PaginationParams agregando búsqueda y filtros comunes
 *
 * @example
 * ```typescript
 * const params: SearchParams = {
 *   page: 1,
 *   limit: 10,
 *   search: 'Juan',
 *   activeOnly: true
 * };
 * ```
 */
export interface SearchParams extends PaginationParams {
  /** Búsqueda por texto (busca en múltiples campos) */
  search?: string;
  /** Si solo se deben retornar elementos activos */
  activeOnly?: boolean;
}

/**
 * Tipo de resultado para operaciones que pueden fallar
 *
 * Patrón de retorno explícito que evita el uso de excepciones,
 * haciendo el manejo de errores más predecible y type-safe.
 *
 * @template T - Tipo de dato retornado en caso de éxito
 *
 * @example
 * ```typescript
 * const result = await createStudent(data);
 * if (result.success) {
 *   console.log(result.data); // TypeScript sabe que data existe
 * } else {
 *   console.error(result.error, result.code); // Manejar error
 * }
 * ```
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Helper para extraer el código de error del payload de un thunk rechazado
 *
 * Útil cuando los errores pueden venir en diferentes formatos:
 * - String simple: "Error message"
 * - Objeto con código: { message: "Error", code: "ERROR_CODE" }
 *
 * @param payload - Payload del thunk rechazado (puede ser string u objeto)
 * @returns Código de error si está disponible, undefined en caso contrario
 *
 * @example
 * ```typescript
 * const code = extractErrorCode(result.payload);
 * if (code === 'VALIDATION_ERROR') {
 *   // Manejar error de validación
 * }
 * ```
 */
export function extractErrorCode(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    return undefined;
  }
  if (payload && typeof payload === 'object' && 'code' in payload) {
    return typeof payload.code === 'string' ? payload.code : undefined;
  }
  return undefined;
}
