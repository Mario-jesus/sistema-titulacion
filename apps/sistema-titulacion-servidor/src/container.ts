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
import {
  CareerModel,
  CareersController,
  CareersService,
} from '@backend/careers';
import { env } from '@backend/core';
import {
  GenerationModel,
  GenerationsController,
  GenerationsService,
} from '@backend/generations';
import {
  ModalityModel,
  ModalitiesController,
  ModalitiesService,
} from '@backend/modalities';
import { UserModel, UsersController, UsersService } from '@backend/users';

export interface AppContainer
  extends AwilixContainer<{
    userModel: typeof UserModel;
    modalityModel: typeof ModalityModel;
    generationModel: typeof GenerationModel;
    careerModel: typeof CareerModel;
    usersService: UsersService;
    modalitiesService: ModalitiesService;
    generationsService: GenerationsService;
    careersService: CareersService;
    usersController: UsersController;
    modalitiesController: ModalitiesController;
    generationsController: GenerationsController;
    careersController: CareersController;
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
    modalityModel: asValue(ModalityModel),
    generationModel: asValue(GenerationModel),
    careerModel: asValue(CareerModel),
    usersService: asClass(UsersService).singleton(),
    modalitiesService: asClass(ModalitiesService).singleton(),
    generationsService: asClass(GenerationsService).singleton(),
    careersService: asClass(CareersService).singleton(),
    usersController: asClass(UsersController).singleton(),
    modalitiesController: asClass(ModalitiesController).singleton(),
    generationsController: asClass(GenerationsController).singleton(),
    careersController: asClass(CareersController).singleton(),
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
