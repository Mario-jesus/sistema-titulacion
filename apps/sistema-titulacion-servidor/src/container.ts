import {
  asClass,
  asValue,
  createContainer,
  type AwilixContainer,
} from 'awilix';
import { UserModel, UsersController, UsersService } from '@backend/users';

export interface AppContainer
  extends AwilixContainer<{
    userModel: typeof UserModel;
    usersService: UsersService;
    usersController: UsersController;
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
  });

  return container as AppContainer;
}
