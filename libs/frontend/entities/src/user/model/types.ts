export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}
