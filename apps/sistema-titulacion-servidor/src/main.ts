import path from 'node:path';
import './load-env';
import {
  connectToDatabase,
  createApp,
  disconnectFromDatabase,
  env,
  logger,
} from '@backend/core';
import {
  createAuthRouter,
  createRequireAuth,
  createRequireRole,
  createRequireRoleOrSelf,
  ensureRefreshTokenTTLIndex,
  RefreshTokenModel,
} from '@backend/auth';
import { createCareersRouter } from '@backend/careers';
import { createGenerationsRouter } from '@backend/generations';
import { createModalitiesRouter } from '@backend/modalities';
import { createUsersRouter } from '@backend/users';
import { createAppContainer } from './container.js';

const container = createAppContainer();
const getAuthService = () => container.resolve('authService');
const requireAdmin = createRequireRole(getAuthService, ['ADMIN']);
const requireAdminOrSelf = createRequireRoleOrSelf(getAuthService, ['ADMIN']);

const usersApiDocPath = path.join(
  process.cwd(),
  'libs/backend/users/src/users.openapi.js'
);
const authApiDocPath = path.join(
  process.cwd(),
  'libs/backend/auth/src/auth.openapi.js'
);
const generationsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/generations/src/generations.openapi.js'
);
const modalitiesApiDocPath = path.join(
  process.cwd(),
  'libs/backend/modalities/src/modalities.openapi.js'
);
const careersApiDocPath = path.join(
  process.cwd(),
  'libs/backend/careers/src/careers.openapi.js'
);

const app = createApp(
  (a) => {
    a.use(
      `${env.API_PREFIX}/auth`,
      createAuthRouter({
        getAuthController: () => container.resolve('authController'),
        getAuthService: () => container.resolve('authService'),
      })
    );
    a.use(
      `${env.API_PREFIX}/users`,
      createRequireAuth(getAuthService),
      createUsersRouter({
        getUsersController: () => container.resolve('usersController'),
        requireAdmin,
        requireAdminOrSelf,
      })
    );
    a.use(
      `${env.API_PREFIX}/modalities`,
      createRequireAuth(getAuthService),
      createModalitiesRouter({
        getModalitiesController: () =>
          container.resolve('modalitiesController'),
        requireAdmin,
      })
    );
    a.use(
      `${env.API_PREFIX}/generations`,
      createRequireAuth(getAuthService),
      createGenerationsRouter({
        getGenerationsController: () =>
          container.resolve('generationsController'),
        requireAdmin,
      })
    );
    a.use(
      `${env.API_PREFIX}/careers`,
      createRequireAuth(getAuthService),
      createCareersRouter({
        getCareersController: () => container.resolve('careersController'),
        requireAdmin,
      })
    );
  },
  {
    swagger: {
      apiDocPaths: [
        authApiDocPath,
        usersApiDocPath,
        modalitiesApiDocPath,
        generationsApiDocPath,
        careersApiDocPath,
      ],
    },
  }
);

const start = async () => {
  try {
    await connectToDatabase();

    // TTL on refreshtokens: delete docs older than refresh expiry + 1 day
    await ensureRefreshTokenTTLIndex(
      RefreshTokenModel,
      env.JWT_REFRESH_EXPIRES + 86400
    );

    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(
        {
          host: env.HOST,
          port: env.PORT,
          apiPrefix: env.API_PREFIX,
        },
        'Server started'
      );
    });

    const shutdown = async (signal: NodeJS.Signals) => {
      logger.info({ signal }, 'Graceful shutdown started');
      server.close(async () => {
        await disconnectFromDatabase();
        logger.info('Graceful shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.fatal({ error }, 'Application failed to start');
    process.exit(1);
  }
};

void start();
