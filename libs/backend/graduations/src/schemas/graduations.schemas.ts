import { z } from 'zod';

const dateLike = z.union([z.string(), z.date()]);

export const createGraduationSchema = z.object({
  studentId: z.string().min(1),
  graduationOptionId: z.union([z.string().min(1), z.null()]).optional(),
  graduationDate: dateLike.optional(),
  scheduledDate: dateLike.optional(),
  president: z.string().min(1).trim(),
  secretary: z.string().min(1).trim(),
  vocal: z.string().min(1).trim(),
  substituteVocal: z.string().min(1).trim(),
  notes: z.union([z.string(), z.null()]).optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: dateLike.optional(),
});

export const updateGraduationSchema = z.object({
  studentId: z.string().min(1).optional(),
  graduationOptionId: z.union([z.string().min(1), z.null()]).optional(),
  graduationDate: dateLike.optional(),
  scheduledDate: dateLike.optional(),
  president: z.string().min(1).trim().optional(),
  secretary: z.string().min(1).trim().optional(),
  vocal: z.string().min(1).trim().optional(),
  substituteVocal: z.string().min(1).trim().optional(),
  notes: z.union([z.string(), z.null()]).optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: dateLike.optional(),
});

export type CreateGraduationInput = z.infer<typeof createGraduationSchema>;
export type UpdateGraduationInput = z.infer<typeof updateGraduationSchema>;
