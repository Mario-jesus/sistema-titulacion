import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';

export interface SwaggerOptions {
  /** Paths to JSDoc files (with @swagger annotations) to include in the spec */
  apiDocPaths: string[];
  /** Base path for the API (defaults to env.API_PREFIX) */
  basePath?: string;
  /** Route where the Swagger UI will be served (default '/api-docs') */
  uiPath?: string;
  /** Route where the OpenAPI JSON will be served (default '/api-docs.json') */
  specPath?: string;
}

const DEFAULT_UI_PATH = '/api-docs';
const DEFAULT_SPEC_PATH = '/api-docs.json';

interface OpenApiSpec {
  paths?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Mounts Swagger UI and the OpenAPI spec on the Express app.
 * Uses swagger-jsdoc to build the spec from the given JSDoc file paths.
 */
export function setupSwagger(app: Express, options: SwaggerOptions): void {
  const basePath = options.basePath ?? env.API_PREFIX;
  const uiPath = options.uiPath ?? DEFAULT_UI_PATH;
  const specPath = options.specPath ?? DEFAULT_SPEC_PATH;

  const spec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sistema de Titulación — API',
        version: '1.0.0',
        description: 'Documentación de la API del backend.',
      },
      servers: [
        { url: `http://localhost:${env.PORT}`, description: 'Local' },
        { url: `http://${env.HOST}:${env.PORT}`, description: 'Server' },
      ],
      basePath,
      tags: [],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: options.apiDocPaths.filter((p) => p.length > 0),
  }) as OpenApiSpec;

  // Ensure paths in the spec are prefixed with basePath (swagger-jsdoc may not always do it)
  if (spec.paths && basePath) {
    const prefixedPaths: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(spec.paths)) {
      const pathKey = key.startsWith(basePath)
        ? key
        : `${basePath}${key.startsWith('/') ? '' : '/'}${key}`;
      prefixedPaths[pathKey] = value;
    }
    spec.paths = prefixedPaths;
  }

  app.get(specPath, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });

  app.use(
    uiPath,
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API — Sistema de Titulación',
    })
  );
}
