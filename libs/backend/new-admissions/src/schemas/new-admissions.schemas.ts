import { z } from 'zod';

export const createNewAdmissionSchema = z.object({
  careerId: z.string().min(1, 'careerId es requerido'),
  generationId: z.string().min(1, 'generationId es requerido'),
  maleCount: z.number().min(0, 'maleCount debe ser >= 0').default(0),
  femaleCount: z.number().min(0, 'femaleCount debe ser >= 0').default(0),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateNewAdmissionSchema = z.object({
  careerId: z.string().min(1).optional(),
  generationId: z.string().min(1).optional(),
  maleCount: z.number().min(0).optional(),
  femaleCount: z.number().min(0).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateNewAdmissionInput = z.infer<typeof createNewAdmissionSchema>;
export type UpdateNewAdmissionInput = z.infer<typeof updateNewAdmissionSchema>;
