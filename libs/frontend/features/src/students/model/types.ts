import type { Student, StudentStatus, Sex } from '@entities/student';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export interface ListStudentsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
  status?: StudentStatus;
  isEgressed?: boolean;
}

export type ListStudentsResponse = ListResponse<Student>;

export interface CreateStudentRequest {
  careerId: string;
  generationId: string;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date | string;
  sex: Sex;
  isEgressed?: boolean;
  status?: StudentStatus;
}

export interface UpdateStudentRequest {
  careerId?: string;
  generationId?: string;
  controlNumber?: string;
  firstName?: string;
  paternalLastName?: string;
  maternalLastName?: string;
  phoneNumber?: string;
  email?: string;
  birthDate?: Date | string;
  sex?: Sex;
  isEgressed?: boolean;
  status?: StudentStatus;
}

export interface StudentError {
  message: string;
  code?: string;
  fieldErrors?: {
    controlNumber?: string;
    firstName?: string;
    paternalLastName?: string;
    maternalLastName?: string;
    phoneNumber?: string;
    email?: string;
    birthDate?: string;
    sex?: string;
    careerId?: string;
    generationId?: string;
  };
}
