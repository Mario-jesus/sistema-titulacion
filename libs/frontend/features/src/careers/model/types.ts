import type { Career } from '@entities/career';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export type ListCareersParams = SearchParams;

export type ListCareersResponse = ListResponse<Career>;

export interface CreateCareerRequest {
  name: string;
  shortName: string;
  modalityId: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateCareerRequest {
  name?: string;
  shortName?: string;
  modalityId?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface CareerError {
  message: string;
  code?: string;
  fieldErrors?: {
    name?: string;
    shortName?: string;
    modalityId?: string;
    description?: string;
  };
}
