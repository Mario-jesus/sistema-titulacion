import { capturedFieldsService } from './capturedFieldsService';
import type { CapturedFields } from '@entities/captured-fields';

/**
 * Helper para buscar campos capturados por studentId
 * Usa el endpoint GET /captured-fields/student/:studentId
 */
export async function findCapturedFieldsByStudentId(
  studentId: string
): Promise<CapturedFields | null> {
  try {
    const capturedFields = await capturedFieldsService.getById(studentId);
    return capturedFields;
  } catch (error) {
    // Si no se encuentra (404), retornar null
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    console.error('Error al buscar campos capturados:', error);
    return null;
  }
}
