import { graduationsService } from './graduationsService';
import type { Graduation } from '@entities/graduation';

/**
 * Helper para buscar titulación por studentId
 * Usa el endpoint GET /graduations/student/:studentId
 */
export async function findGraduationByStudentId(
  studentId: string
): Promise<Graduation | null> {
  try {
    const graduation = await graduationsService.getById(studentId);
    return graduation;
  } catch (error) {
    // Si no se encuentra (404), retornar null
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    console.error('Error al buscar titulación:', error);
    return null;
  }
}
