import type { User } from '@entities/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthError {
  message: string;
  code?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}
