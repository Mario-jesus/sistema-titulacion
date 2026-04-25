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
import {
  GraduationOptionModel,
  GraduationOptionsController,
  GraduationOptionsService,
} from '@backend/graduation-options';
import {
  NewAdmissionModel,
  NewAdmissionsController,
  NewAdmissionsService,
} from '@backend/new-admissions';
import {
  StudentModel,
  GraduationModel,
  CapturedFieldsModel,
  StudentsController,
  StudentsService,
} from '@backend/students';
import {
  CapturedFieldsController,
  CapturedFieldsService,
} from '@backend/captured-fields';
import {
  GraduationsController,
  GraduationsService,
} from '@backend/graduations';
import {
  IngressEgressController,
  IngressEgressService,
} from '@backend/ingress-egress';
import { DashboardController, DashboardService } from '@backend/dashboard';
import { ReportsController, ReportsService } from '@backend/reports';
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

export type AppContainer = AwilixContainer<{
  userModel: typeof UserModel;
  modalityModel: typeof ModalityModel;
  generationModel: typeof GenerationModel;
  careerModel: typeof CareerModel;
  graduationOptionModel: typeof GraduationOptionModel;
  newAdmissionModel: typeof NewAdmissionModel;
  usersService: UsersService;
  modalitiesService: ModalitiesService;
  generationsService: GenerationsService;
  careersService: CareersService;
  graduationOptionsService: GraduationOptionsService;
  newAdmissionsService: NewAdmissionsService;
  usersController: UsersController;
  modalitiesController: ModalitiesController;
  generationsController: GenerationsController;
  careersController: CareersController;
  graduationOptionsController: GraduationOptionsController;
  newAdmissionsController: NewAdmissionsController;
  studentModel: typeof StudentModel;
  graduationModel: typeof GraduationModel;
  capturedFieldsModel: typeof CapturedFieldsModel;
  studentsService: StudentsService;
  studentsController: StudentsController;
  capturedFieldsService: CapturedFieldsService;
  capturedFieldsController: CapturedFieldsController;
  graduationsService: GraduationsService;
  graduationsController: GraduationsController;
  ingressEgressService: IngressEgressService;
  ingressEgressController: IngressEgressController;
  dashboardService: DashboardService;
  dashboardController: DashboardController;
  reportsService: ReportsService;
  reportsController: ReportsController;
  refreshTokenModel: typeof RefreshTokenModel;
  refreshTokenStore: ReturnType<typeof createMongoRefreshTokenStore>;
  authService: AuthService;
  authController: AuthController;
}>;

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
    graduationOptionModel: asValue(GraduationOptionModel),
    newAdmissionModel: asValue(NewAdmissionModel),
    usersService: asClass(UsersService).singleton(),
    modalitiesService: asClass(ModalitiesService).singleton(),
    generationsService: asClass(GenerationsService).singleton(),
    careersService: asClass(CareersService).singleton(),
    graduationOptionsService: asClass(GraduationOptionsService).singleton(),
    newAdmissionsService: asClass(NewAdmissionsService).singleton(),
    usersController: asClass(UsersController).singleton(),
    modalitiesController: asClass(ModalitiesController).singleton(),
    generationsController: asClass(GenerationsController).singleton(),
    careersController: asClass(CareersController).singleton(),
    graduationOptionsController: asClass(
      GraduationOptionsController
    ).singleton(),
    newAdmissionsController: asClass(NewAdmissionsController).singleton(),
    studentModel: asValue(StudentModel),
    graduationModel: asValue(GraduationModel),
    capturedFieldsModel: asValue(CapturedFieldsModel),
    studentsService: asClass(StudentsService).singleton(),
    studentsController: asClass(StudentsController).singleton(),
    capturedFieldsService: asClass(CapturedFieldsService).singleton(),
    capturedFieldsController: asClass(CapturedFieldsController).singleton(),
    graduationsService: asClass(GraduationsService).singleton(),
    graduationsController: asClass(GraduationsController).singleton(),
    ingressEgressService: asClass(IngressEgressService).singleton(),
    ingressEgressController: asClass(IngressEgressController).singleton(),
    dashboardService: asClass(DashboardService).singleton(),
    dashboardController: asClass(DashboardController).singleton(),
    reportsService: asClass(ReportsService).singleton(),
    reportsController: asClass(ReportsController).singleton(),
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
