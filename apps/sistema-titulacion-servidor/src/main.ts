import path from 'node:path';
import './load-env';
import {
  connectToDatabase,
  createApp,
  disconnectFromDatabase,
  env,
  logger,
} from '@backend/core';
import { createUsersRouter } from '@backend/users';
import { createAppContainer } from './container.js';

const container = createAppContainer();

const usersApiDocPath = path.join(
  process.cwd(),
  'libs/backend/users/src/users.openapi.js'
);

const app = createApp(
  (a) => {
    a.use(
      `${env.API_PREFIX}/users`,
      createUsersRouter({
        getUsersController: () => container.resolve('usersController'),
      })
    );
  },
  {
    swagger: { apiDocPaths: [usersApiDocPath] },
  }
);

const start = async () => {
  try {
    await connectToDatabase();

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
