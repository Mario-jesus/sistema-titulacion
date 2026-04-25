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
import { createGraduationOptionsRouter } from '@backend/graduation-options';
import { createNewAdmissionsRouter } from '@backend/new-admissions';
import { createStudentsRouter } from '@backend/students';
import { createCapturedFieldsRouter } from '@backend/captured-fields';
import { createGraduationsRouter } from '@backend/graduations';
import { createIngressEgressRouter } from '@backend/ingress-egress';
import { createDashboardRouter } from '@backend/dashboard';
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
const graduationOptionsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/graduation-options/src/graduation-options.openapi.js'
);
const newAdmissionsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/new-admissions/src/new-admissions.openapi.js'
);
const studentsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/students/src/students.openapi.js'
);
const capturedFieldsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/captured-fields/src/captured-fields.openapi.js'
);
const graduationsApiDocPath = path.join(
  process.cwd(),
  'libs/backend/graduations/src/graduations.openapi.js'
);
const ingressEgressApiDocPath = path.join(
  process.cwd(),
  'libs/backend/ingress-egress/src/ingress-egress.openapi.js'
);
const dashboardApiDocPath = path.join(
  process.cwd(),
  'libs/backend/dashboard/src/dashboard.openapi.js'
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
    a.use(
      `${env.API_PREFIX}/graduation-options`,
      createRequireAuth(getAuthService),
      createGraduationOptionsRouter({
        getGraduationOptionsController: () =>
          container.resolve('graduationOptionsController'),
        requireAdmin,
      })
    );
    a.use(
      `${env.API_PREFIX}/new-admissions`,
      createRequireAuth(getAuthService),
      createNewAdmissionsRouter({
        getNewAdmissionsController: () =>
          container.resolve('newAdmissionsController'),
        requireAdmin,
      })
    );
    a.use(
      `${env.API_PREFIX}/students`,
      createRequireAuth(getAuthService),
      createStudentsRouter({
        getStudentsController: () => container.resolve('studentsController'),
      })
    );
    a.use(
      `${env.API_PREFIX}/captured-fields`,
      createRequireAuth(getAuthService),
      createCapturedFieldsRouter({
        getCapturedFieldsController: () =>
          container.resolve('capturedFieldsController'),
      })
    );
    a.use(
      `${env.API_PREFIX}/graduations`,
      createRequireAuth(getAuthService),
      createGraduationsRouter({
        getGraduationsController: () =>
          container.resolve('graduationsController'),
      })
    );
    a.use(
      `${env.API_PREFIX}/ingress-egress`,
      createRequireAuth(getAuthService),
      createIngressEgressRouter({
        getIngressEgressController: () =>
          container.resolve('ingressEgressController'),
      })
    );
    a.use(
      `${env.API_PREFIX}/dashboard`,
      createRequireAuth(getAuthService),
      createDashboardRouter({
        getDashboardController: () => container.resolve('dashboardController'),
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
        graduationOptionsApiDocPath,
        newAdmissionsApiDocPath,
        studentsApiDocPath,
        capturedFieldsApiDocPath,
        graduationsApiDocPath,
        ingressEgressApiDocPath,
        dashboardApiDocPath,
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
