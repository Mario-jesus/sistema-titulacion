import { graduationOptionsService } from '@features/graduation-options';

/**
 * Helper para cargar opciones de graduación activas
 * Útil para formularios y filtros
 */
export async function loadGraduationOptions() {
  try {
    const response = await graduationOptionsService.list({
      activeOnly: true,
      limit: 1000, // Obtener todas las opciones activas
      sortBy: 'name',
      sortOrder: 'asc',
    });
    return response.data;
  } catch (error) {
    console.error('Error al cargar opciones de graduación:', error);
    return [];
  }
}
