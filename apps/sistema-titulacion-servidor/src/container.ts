import {
  asClass,
  asValue,
  createContainer,
  type AwilixContainer,
} from 'awilix';
import {
  AuthController,
  AuthService,
  createMongoRefreshTokenStore,
  RefreshTokenModel,
} from '@backend/auth';
import { env } from '@backend/core';
import { UserModel, UsersController, UsersService } from '@backend/users';

export interface AppContainer
  extends AwilixContainer<{
    userModel: typeof UserModel;
    usersService: UsersService;
    usersController: UsersController;
    refreshTokenModel: typeof RefreshTokenModel;
    refreshTokenStore: ReturnType<typeof createMongoRefreshTokenStore>;
    authService: AuthService;
    authController: AuthController;
  }> {}

/**
 * Creates and configures the Awilix DI container for the server app.
 * Register new modules here as the backend grows.
 */
export function createAppContainer(): AppContainer {
  const container = createContainer({
    injectionMode: 'CLASSIC', // inject by parameter name
  });

  container.register({
    userModel: asValue(UserModel),
    usersService: asClass(UsersService).singleton(),
    usersController: asClass(UsersController).singleton(),
    refreshTokenModel: asValue(RefreshTokenModel),
    refreshTokenStore: asValue(createMongoRefreshTokenStore(RefreshTokenModel)),
    jwtSecret: asValue(env.JWT_SECRET),
    jwtAccessExpires: asValue(env.JWT_ACCESS_EXPIRES),
    jwtRefreshExpires: asValue(env.JWT_REFRESH_EXPIRES),
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton(),
  });

  return container as AppContainer;
}
