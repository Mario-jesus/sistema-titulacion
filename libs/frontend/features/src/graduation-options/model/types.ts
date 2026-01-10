import type { GraduationOption } from '@entities/graduation-option';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export type ListGraduationOptionsParams = SearchParams;

export type ListGraduationOptionsResponse = ListResponse<GraduationOption>;

export interface CreateGraduationOptionRequest {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateGraduationOptionRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface GraduationOptionError {
  message: string;
  code?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
  };
}
