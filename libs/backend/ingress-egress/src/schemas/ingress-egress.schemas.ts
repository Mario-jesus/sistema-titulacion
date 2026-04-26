import { z } from 'zod';

export const INGRESS_EGRESS_SORT_FIELDS = [
  'careerName',
  'generationName',
  'admissionNumber',
  'egressNumber',
] as const;

export const listIngressEgressSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).optional().default(10),
  search: z.string().optional(),
  q: z.string().optional(),
  careerId: z.string().optional(),
  generationId: z.string().optional(),
  sortBy: z.enum(INGRESS_EGRESS_SORT_FIELDS).optional().default('careerName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  includeInactiveAdmissions: z.coerce.boolean().optional().default(false),
});

export type ListIngressEgressQuery = z.infer<typeof listIngressEgressSchema>;
