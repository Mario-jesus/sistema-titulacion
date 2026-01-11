import type { User } from '@entities/user/model';
import type { UserRole } from '@entities/user/model';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export type ListUsersParams = SearchParams & {
  role?: UserRole;
};

export type ListUsersResponse = ListResponse<User>;

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  role: 'ADMIN' | 'STAFF';
  isActive?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'ADMIN' | 'STAFF';
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword?: string; // Opcional para admin, requerido para usuario propio
  newPassword: string;
}

export interface UserError {
  message: string;
  code?: string;
  fieldErrors?: {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  };
}
