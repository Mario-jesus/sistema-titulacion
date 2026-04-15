import { z } from 'zod';

export const createStudentSchema = z.object({
  careerId: z.string().min(1),
  generationId: z.string().min(1),
  controlNumber: z.string().min(1).trim(),
  firstName: z.string().min(1).trim(),
  paternalLastName: z.string().min(1).trim(),
  maternalLastName: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
  email: z.string().min(1).trim(),
  birthDate: z.string().or(z.date()),
  sex: z.enum(['MASCULINO', 'FEMENINO']),
  isEgressed: z.boolean().optional().default(false),
  status: z
    .enum(['ACTIVO', 'PAUSADO', 'CANCELADO'])
    .optional()
    .default('ACTIVO'),
  processStatus: z
    .enum(['NOT_STARTED', 'IN_PROCESS', 'SCHEDULED', 'GRADUATED'])
    .optional()
    .default('NOT_STARTED'),
  hasIdCard: z.boolean().optional().default(false),
});

export const updateStudentSchema = z.object({
  careerId: z.string().min(1).optional(),
  generationId: z.string().min(1).optional(),
  controlNumber: z.string().min(1).trim().optional(),
  firstName: z.string().min(1).trim().optional(),
  paternalLastName: z.string().min(1).trim().optional(),
  maternalLastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().min(1).trim().optional(),
  birthDate: z.string().or(z.date()).optional(),
  sex: z.enum(['MASCULINO', 'FEMENINO']).optional(),
  isEgressed: z.boolean().optional(),
  status: z.enum(['ACTIVO', 'PAUSADO', 'CANCELADO']).optional(),
  processStatus: z
    .enum(['NOT_STARTED', 'IN_PROCESS', 'SCHEDULED', 'GRADUATED'])
    .optional(),
  hasIdCard: z.boolean().optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(['ACTIVO', 'PAUSADO', 'CANCELADO']),
});

export const processStatusSchema = z.object({
  processStatus: z.enum([
    'NOT_STARTED',
    'IN_PROCESS',
    'SCHEDULED',
    'GRADUATED',
  ]),
  hasIdCard: z.boolean().optional(),
  scheduledDate: z.string().optional(),
  graduationDate: z.string().optional(),
  idCardNumber: z.string().optional(),
  idCardIssueDate: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ProcessStatusInput = z.infer<typeof processStatusSchema>;
