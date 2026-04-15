import { z } from 'zod';

export const createCapturedFieldsSchema = z.object({
  studentId: z.string().min(1),
  processDate: z.union([z.string(), z.date()]),
  projectName: z.string().min(1).trim(),
  company: z.string().min(1).trim(),
});

export const updateCapturedFieldsSchema = z.object({
  studentId: z.string().min(1).optional(),
  processDate: z.union([z.string(), z.date()]).optional(),
  projectName: z.string().min(1).trim().optional(),
  company: z.string().min(1).trim().optional(),
});

export type CreateCapturedFieldsInput = z.infer<
  typeof createCapturedFieldsSchema
>;
export type UpdateCapturedFieldsInput = z.infer<
  typeof updateCapturedFieldsSchema
>;
