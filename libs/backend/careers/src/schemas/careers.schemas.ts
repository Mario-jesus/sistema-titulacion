import { z } from 'zod';

export const createCareerSchema = z.object({
  name: z.string().min(1, 'name es requerido').trim(),
  shortName: z.string().min(1, 'shortName es requerido').trim(),
  modalityId: z.string().min(1, 'modalityId es requerido'),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCareerSchema = z.object({
  name: z.string().min(1).trim().optional(),
  shortName: z.string().min(1).trim().optional(),
  modalityId: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
