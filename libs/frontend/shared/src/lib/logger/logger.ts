import { env, type LogLevel } from '../../config/env';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const minLogLevelValue = LOG_LEVELS[env.minLogLevel as LogLevel] ?? 0;

function shouldLog(level: LogLevel): boolean {
  return env.enableLogger && LOG_LEVELS[level] >= minLogLevelValue;
}

export const logger = {
  log: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  },
};
