import { z } from 'zod';

const usernameRegex = /^[a-zA-Z0-9]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const createUserSchema = z.object({
  username: z
    .string()
    .min(1, 'username es requerido')
    .regex(usernameRegex, 'username solo debe contener letras y números'),
  email: z
    .string()
    .min(1, 'email es requerido')
    .regex(emailRegex, 'email inválido'),
  password: z
    .string()
    .min(8, 'password mínimo 8 caracteres')
    .regex(
      passwordRegex,
      'password debe tener al menos: 1 número, 1 minúscula, 1 mayúscula, 1 símbolo'
    ),
  avatar: z.string().nullable().optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional().default('STAFF'),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  username: z.string().min(1).regex(usernameRegex).optional(),
  email: z.string().regex(emailRegex).optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  isActive: z.boolean().optional(),
});

export const patchMeSchema = z.object({
  username: z.string().min(1).regex(usernameRegex).optional(),
  email: z.string().regex(emailRegex).optional(),
  avatar: z.string().nullable().optional(),
});

export const changePasswordMeSchema = z.object({
  currentPassword: z.string().min(1, 'currentPassword es requerido'),
  newPassword: z
    .string()
    .min(8, 'password mínimo 8 caracteres')
    .regex(
      passwordRegex,
      'password debe tener al menos: 1 número, 1 minúscula, 1 mayúscula, 1 símbolo'
    ),
});

export const changePasswordAdminSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'password mínimo 8 caracteres')
    .regex(
      passwordRegex,
      'password debe tener al menos: 1 número, 1 minúscula, 1 mayúscula, 1 símbolo'
    ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type PatchMeInput = z.infer<typeof patchMeSchema>;
export type ChangePasswordMeInput = z.infer<typeof changePasswordMeSchema>;
export type ChangePasswordAdminInput = z.infer<
  typeof changePasswordAdminSchema
>;
