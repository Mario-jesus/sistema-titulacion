import { z } from 'zod';

const dateSchema = z.union([
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  z.date(),
]);

export const createGenerationSchema = z
  .object({
    name: z.string().trim().nullable().optional(),
    startYear: dateSchema,
    endYear: dateSchema,
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      const start = new Date(data.startYear).getTime();
      const end = new Date(data.endYear).getTime();
      return start < end;
    },
    { message: 'startYear debe ser menor que endYear', path: ['endYear'] }
  );

export const updateGenerationSchema = z
  .object({
    name: z.string().trim().nullable().optional(),
    startYear: dateSchema.optional(),
    endYear: dateSchema.optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startYear === undefined && data.endYear === undefined)
        return true;
      const start = data.startYear
        ? new Date(data.startYear).getTime()
        : undefined;
      const end = data.endYear ? new Date(data.endYear).getTime() : undefined;
      if (start !== undefined && end !== undefined) return start < end;
      return true;
    },
    { message: 'startYear debe ser menor que endYear', path: ['endYear'] }
  );

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
export type UpdateGenerationInput = z.infer<typeof updateGenerationSchema>;
