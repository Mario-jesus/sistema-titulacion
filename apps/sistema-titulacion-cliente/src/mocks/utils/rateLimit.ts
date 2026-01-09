/**
 * Utilidades para simular rate limiting
 */

// Almacén de intentos por IP/identificador
// Formato: Map<identifier, { count: number, resetAt: number }>
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Límites de rate limiting
const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  REFRESH: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
};

/**
 * Obtiene un identificador único del request
 */
function getIdentifier(request: Request): string {
  // En producción esto usaría la IP real
  // Para el mock, usamos un identificador simple
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  return `rate-limit-${userAgent}`;
}

/**
 * Verifica si se ha excedido el rate limit
 * @param request - Request a verificar
 * @param type - Tipo de rate limit (LOGIN o REFRESH)
 * @returns true si se excedió el límite, false en caso contrario
 */
export function checkRateLimit(request: Request, type: 'LOGIN' | 'REFRESH'): boolean {
  const identifier = getIdentifier(request);
  const limit = RATE_LIMITS[type];
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record) {
    // Primera vez, crear registro
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + limit.windowMs,
    });
    return false;
  }

  // Si el período de ventana expiró, reiniciar
  if (now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + limit.windowMs,
    });
    return false;
  }

  // Incrementar contador
  record.count++;

  // Verificar si se excedió el límite
  if (record.count > limit.maxAttempts) {
    return true;
  }

  rateLimitStore.set(identifier, record);
  return false;
}

/**
 * Limpia los registros de rate limit expirados
 */
export function cleanExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpiar registros expirados cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredRateLimits, 5 * 60 * 1000);
}
