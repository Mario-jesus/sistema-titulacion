import { z } from 'zod';

export const createModalitySchema = z.object({
  name: z.string().min(1, 'name es requerido').trim(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateModalitySchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateModalityInput = z.infer<typeof createModalitySchema>;
export type UpdateModalityInput = z.infer<typeof updateModalitySchema>;
