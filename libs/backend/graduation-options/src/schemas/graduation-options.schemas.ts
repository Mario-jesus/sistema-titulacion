import { z } from 'zod';

export const createGraduationOptionSchema = z.object({
  name: z.string().min(1, 'name es requerido').trim(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateGraduationOptionSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateGraduationOptionInput = z.infer<
  typeof createGraduationOptionSchema
>;
export type UpdateGraduationOptionInput = z.infer<
  typeof updateGraduationOptionSchema
>;
