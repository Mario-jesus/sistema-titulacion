import type { GraduationOption } from '@entities/graduation-option';

/**
 * Datos mock de opciones de titulación para testing
 */
export const mockGraduationOptions: GraduationOption[] = [
  {
    id: '1',
    name: 'Tesis',
    description: 'Proyecto de investigación y tesis',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    name: 'Residencia Profesional',
    description:
      'Desarrollo de proyecto durante residencia profesional en empresa',
    isActive: true,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Modelo Dual',
    description: 'Proyecto desarrollado en modelo dual',
    isActive: false,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
  {
    id: '4',
    name: 'Examen de Conocimientos',
    description: null,
    isActive: true,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-18T10:00:00Z'),
  },
];

/**
 * Busca una opción de titulación por ID
 */
export function findGraduationOptionById(
  id: string
): GraduationOption | undefined {
  return mockGraduationOptions.find((option) => option.id === id);
}

/**
 * Genera un nuevo ID para una opción de titulación
 */
export function generateGraduationOptionId(): string {
  const maxId = Math.max(
    ...mockGraduationOptions.map((opt) => parseInt(opt.id, 10)),
    0
  );
  return String(maxId + 1);
}
