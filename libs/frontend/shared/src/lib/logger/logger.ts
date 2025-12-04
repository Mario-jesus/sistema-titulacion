import { env, type LogLevel } from '../../config/env';

const minLogLevel: LogLevel = env.minLogLevel;

export const logger = {
  log: (...args: unknown[]) => {
    if (env.enableLogger && minLogLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (env.enableLogger && minLogLevel === 'info') {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (env.enableLogger && minLogLevel === 'warn') {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (env.enableLogger && minLogLevel === 'error') {
      console.error('[ERROR]', ...args);
    }
  },
};
