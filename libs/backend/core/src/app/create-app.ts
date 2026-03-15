import type { Express } from 'express';
import cors from 'cors';
import express from 'express';
import { env } from '../config/env.js';
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
import { requestLogger } from '../middleware/request-logger.js';
import { healthRouter } from '../routes/health.routes.js';
import { setupSwagger } from '../swagger/setup-swagger.js';

function getCorsOrigin(origin: string): string | string[] | false {
  if (origin === '*' || origin === '') return '*';
  return origin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export interface CreateAppOptions {
  /** If set, Swagger UI and OpenAPI spec are mounted from these JSDoc paths */
  swagger?: { apiDocPaths: string[] };
}

export const createApp = (
  mountRouters?: (app: Express) => void,
  options?: CreateAppOptions
) => {
  const app = express();

  app.disable('x-powered-by');
  const allowedOrigins = getCorsOrigin(env.CORS_ORIGIN);
  app.use(
    cors({
      origin: Array.isArray(allowedOrigins)
        ? allowedOrigins
        : allowedOrigins === '*'
        ? true
        : [allowedOrigins],
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/', healthRouter);
  app.use(env.API_PREFIX, healthRouter);

  mountRouters?.(app);

  if (options?.swagger?.apiDocPaths?.length) {
    setupSwagger(app, {
      apiDocPaths: options.swagger.apiDocPaths,
      basePath: env.API_PREFIX,
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
