/**
 * Utilidades para manejar tokens mock
 */

/**
 * Genera un token mock para un usuario
 * @param userId - ID del usuario
 * @returns Token mock
 */
export function generateToken(userId: string): string {
  return `mock-token-${userId}-${Date.now()}`;
}

/**
 * Extrae el userId de un token mock
 * @param token - Token mock
 * @returns userId o null si el token es inválido
 */
export function extractUserIdFromToken(token: string): string | null {
  if (!token || !token.startsWith('mock-token-')) {
    return null;
  }
  const parts = token.split('-');
  return parts[2] || null;
}

/**
 * Extrae el userId de un refresh token mock
 * @param refreshToken - Refresh token mock
 * @returns userId o null si el token es inválido
 */
export function extractUserIdFromRefreshToken(refreshToken: string): string | null {
  if (!refreshToken || !refreshToken.startsWith('refresh-')) {
    return null;
  }
  const tokenPart = refreshToken.replace('refresh-mock-token-', '');
  const parts = tokenPart.split('-');
  return parts[0] || null;
}
