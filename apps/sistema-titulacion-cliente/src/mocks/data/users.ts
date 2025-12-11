import { UserRole, type User } from '@entities/user/model';

/**
 * Datos mock de usuarios para testing
 */
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    avatar: null,
    role: UserRole.ADMIN,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    username: 'staff',
    email: 'staff@example.com',
    avatar: null,
    role: UserRole.STAFF,
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
];

/**
 * Busca un usuario por email
 */
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email);
}

/**
 * Busca un usuario por ID
 */
export function findUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}
