import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const requestId =
      typeof existing === 'string' && existing.length > 0
        ? existing
        : randomUUID();

    res.setHeader('x-request-id', requestId);
    return requestId;
  },
});
