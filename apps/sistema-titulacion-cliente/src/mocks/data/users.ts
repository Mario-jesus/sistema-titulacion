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
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Busca un usuario por ID
 */
export function findUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

/**
 * Busca un usuario por username
 */
export function findUserByUsername(username: string): User | undefined {
  return mockUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Genera un nuevo ID para un usuario
 */
export function generateUserId(): string {
  const maxId = Math.max(...mockUsers.map((u) => parseInt(u.id, 10)), 0);
  return String(maxId + 1);
}

/**
 * Mapa de contraseñas por ID de usuario
 * En producción esto estaría hasheado
 */
const userPasswords = new Map<string, string>([
  ['1', 'password123'], // admin@example.com
  ['2', 'password123'], // staff@example.com
]);

/**
 * Obtiene la contraseña de un usuario
 */
export function getUserPassword(userId: string): string | undefined {
  return userPasswords.get(userId);
}

/**
 * Establece la contraseña de un usuario
 */
export function setUserPassword(userId: string, password: string): void {
  userPasswords.set(userId, password);
}

/**
 * Valida la contraseña de un usuario
 */
export function validateUserPassword(userId: string, password: string): boolean {
  const storedPassword = userPasswords.get(userId);
  return storedPassword === password;
}
