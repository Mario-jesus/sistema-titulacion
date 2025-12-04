import type { User } from '@entities/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}
