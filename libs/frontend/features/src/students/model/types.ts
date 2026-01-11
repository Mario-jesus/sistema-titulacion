import type { Student, StudentStatus, Sex } from '@entities/student';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export interface ListStudentsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
  status?: StudentStatus;
  isEgressed?: boolean;
}

export type ListStudentsResponse = ListResponse<Student>;

// Tipos para estudiantes en proceso
export interface InProgressStudent {
  controlNumber: string;
  fullName: string;
  sex: string;
  careerId: string;
  graduationOptionId: string | null;
  projectName: string | null;
}

export interface ListInProgressStudentsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
  sex?: string;
}

export type ListInProgressStudentsResponse = ListResponse<InProgressStudent>;

// Tipos para estudiantes programados
export interface ScheduledStudent {
  controlNumber: string;
  fullName: string;
  sex: string;
  careerId: string;
  graduationOptionId: string | null;
  graduationDate: string | null;
  isGraduated: boolean;
}

export interface ListScheduledStudentsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
  sex?: string;
}

export type ListScheduledStudentsResponse = ListResponse<ScheduledStudent>;

// Tipos para estudiantes titulados
export interface GraduatedStudent {
  controlNumber: string;
  fullName: string;
  sex: string;
  careerId: string;
  generationId: string;
  graduationOptionId: string;
  graduationDate: string;
}

export interface ListGraduatedStudentsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
  sex?: string;
}

export type ListGraduatedStudentsResponse = ListResponse<GraduatedStudent>;

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
