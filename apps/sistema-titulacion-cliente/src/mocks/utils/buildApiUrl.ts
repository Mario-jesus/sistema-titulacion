import { env } from '@shared/config';

/**
 * Construye la URL completa para un endpoint de la API
 * @param endpoint - Endpoint relativo (ej: '/auth/login')
 * @returns URL completa (ej: 'http://localhost:3000/api/v1/auth/login')
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = env.apiBaseUrl || 'http://localhost:3000/api/v1';
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}
