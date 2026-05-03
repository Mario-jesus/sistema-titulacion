import { z } from 'zod';

const dateLike = z.union([z.string(), z.date()]);

export const createGraduationSchema = z.object({
  studentId: z.string().min(1),
  graduationOptionId: z.string().min(1),
  graduationDate: dateLike.optional(),
  scheduledDate: dateLike.optional(),
  president: z.string().trim().optional(),
  secretary: z.string().trim().optional(),
  vocal: z.string().trim().optional(),
  substituteVocal: z.string().trim().optional(),
  notes: z.union([z.string(), z.null()]).optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: dateLike.optional(),
});

export const updateGraduationSchema = z.object({
  studentId: z.string().min(1).optional(),
  graduationOptionId: z.union([z.string().min(1), z.null()]).optional(),
  graduationDate: dateLike.optional(),
  scheduledDate: dateLike.optional(),
  president: z.string().trim().optional(),
  secretary: z.string().trim().optional(),
  vocal: z.string().trim().optional(),
  substituteVocal: z.string().trim().optional(),
  notes: z.union([z.string(), z.null()]).optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: dateLike.optional(),
});

export type CreateGraduationInput = z.infer<typeof createGraduationSchema>;
export type UpdateGraduationInput = z.infer<typeof updateGraduationSchema>;
