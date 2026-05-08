import { z } from 'zod';

export const createBackupSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional(),
});

export const uploadBackupBodySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(500).optional(),
});

export const listBackupsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

export type CreateBackupInput = z.infer<typeof createBackupSchema>;
export type UploadBackupInput = z.infer<typeof uploadBackupBodySchema>;
export type ListBackupsQueryInput = z.infer<typeof listBackupsQuerySchema>;
