import type { NewAdmission } from '@entities/new-admission';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export interface ListNewAdmissionsParams extends SearchParams {
  careerId?: string;
  generationId?: string;
}

export type ListNewAdmissionsResponse = ListResponse<NewAdmission>;

export interface CreateNewAdmissionRequest {
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateNewAdmissionRequest {
  generationId?: string;
  careerId?: string;
  maleCount?: number;
  femaleCount?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface NewAdmissionError {
  message: string;
  code?: string;
  fieldErrors?: {
    generationId?: string;
    careerId?: string;
    maleCount?: string;
    femaleCount?: string;
    description?: string;
  };
}
