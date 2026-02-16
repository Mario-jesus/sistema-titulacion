export enum Sex {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export enum StudentStatus {
  ACTIVO = 'ACTIVO',
  PAUSADO = 'PAUSADO',
  CANCELADO = 'CANCELADO',
}

export enum StudentProcessStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROCESS = 'IN_PROCESS',
  SCHEDULED = 'SCHEDULED',
  GRADUATED = 'GRADUATED',
}

export interface Student {
  id: string;
  careerId: string;
  generationId: string;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date;
  sex: Sex;
  isEgressed: boolean;
  status: StudentStatus;
  processStatus: StudentProcessStatus;
  hasIdCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}
