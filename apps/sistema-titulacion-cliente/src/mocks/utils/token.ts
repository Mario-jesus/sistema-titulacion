/**
 * Utilidades para manejar tokens mock con rotación
 */

// Almacén de refresh tokens activos por usuario
// Formato: Map<userId, refreshToken>
const activeRefreshTokens = new Map<string, string>();

// Tiempo de expiración del token en segundos (1 hora)
export const TOKEN_EXPIRES_IN = 3600;

/**
 * Genera un token mock para un usuario
 * @param userId - ID del usuario
 * @returns Token mock
 */
export function generateToken(userId: string): string {
  return `mock-token-${userId}-${Date.now()}`;
}

/**
 * Genera un refresh token mock único para un usuario
 * @param userId - ID del usuario
 * @returns Refresh token mock
 */
export function generateRefreshToken(userId: string): string {
  return `refresh-mock-token-${userId}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;
}

/**
 * Almacena un refresh token activo para un usuario
 * @param userId - ID del usuario
 * @param refreshToken - Refresh token a almacenar
 */
export function storeRefreshToken(userId: string, refreshToken: string): void {
  activeRefreshTokens.set(userId, refreshToken);
}

/**
 * Valida si un refresh token es válido (está activo y es el último emitido)
 * @param userId - ID del usuario
 * @param refreshToken - Refresh token a validar
 * @returns true si el token es válido, false en caso contrario
 */
export function validateRefreshToken(
  userId: string,
  refreshToken: string
): boolean {
  const activeToken = activeRefreshTokens.get(userId);
  return activeToken === refreshToken;
}

/**
 * Invalida el refresh token de un usuario (lo elimina del almacén)
 * @param userId - ID del usuario
 */
export function invalidateRefreshToken(userId: string): void {
  activeRefreshTokens.delete(userId);
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
export function extractUserIdFromRefreshToken(
  refreshToken: string
): string | null {
  if (!refreshToken || !refreshToken.startsWith('refresh-mock-token-')) {
    return null;
  }
  const tokenPart = refreshToken.replace('refresh-mock-token-', '');
  const parts = tokenPart.split('-');
  return parts[0] || null;
}
