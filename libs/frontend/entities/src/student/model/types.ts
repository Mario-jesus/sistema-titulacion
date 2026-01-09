export enum Sex {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export enum StudentStatus {
  ACTIVO = 'ACTIVO',
  PAUSADO = 'PAUSADO',
  CANCELADO = 'CANCELADO',
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
  createdAt: Date;
  updatedAt: Date;
}
