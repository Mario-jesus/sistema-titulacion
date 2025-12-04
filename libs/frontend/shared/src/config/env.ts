export const env = {
  // Ambiente
  appEnv: import.meta.env.VITE_APP_ENV || 'development',

  // API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 5000,

  // Información de la app
  appName: import.meta.env.VITE_APP_NAME || 'Sistema de Titulación',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.1',

  // Configuraciones del logger
  enableLogger: import.meta.env.VITE_ENABLE_LOGGER === 'true',
  minLogLevel: import.meta.env.VITE_MIN_LOG_LEVEL || 'debug',

  // Mock API
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
} as const;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function validateEnv(): void {
  if (env.appEnv === 'development') {
    const requiredVars = ['VITE_API_BASE_URL', 'VITE_APP_ENV'];
    const missing = requiredVars.filter(
      (varName) => !import.meta.env[varName]
    );

    if (missing.length > 0) {
      console.warn(
        `Variables de entorno faltantes: ${missing.join(', ')}`
      );
    }

    const validLogLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(env.minLogLevel as LogLevel)) {
      console.warn(
        `VITE_MIN_LOG_LEVEL inválido: "${env.minLogLevel}". Usar: ${validLogLevels.join(', ')}`
      );
    }
  }
}

if (env.appEnv === 'development') {
  validateEnv();
}
