import { z } from 'zod';

export const generateReportSchema = z.object({
  dateRange: z
    .object({
      type: z.enum(['general', 'specific']),
      startYear: z.number().int().optional(),
      endYear: z.number().int().optional(),
    })
    .optional(),
  careers: z
    .object({
      type: z.enum(['general', 'specific']),
      selected: z.array(z.string()).optional(),
    })
    .optional(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
  careerIds: z.array(z.string()).optional(),
  graduationRateDenominator: z.enum(['ingreso', 'egreso']),
  includeOtherValue: z.boolean(),
  reportType: z.enum(['por-generaciones', 'por-carreras']),
  sex: z.enum(['general', 'MASCULINO', 'FEMENINO']).optional(),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
