import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'email es requerido').email('email inválido'),
  password: z.string().min(1, 'password es requerido'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken es requerido'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
