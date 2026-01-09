import type { Generation } from '@entities/generation';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export type ListGenerationsParams = SearchParams;

export type ListGenerationsResponse = ListResponse<Generation>;

export interface CreateGenerationRequest {
  name: string;
  startYear: string | Date; // ISO string o Date
  endYear: string | Date; // ISO string o Date
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateGenerationRequest {
  name?: string;
  startYear?: string | Date;
  endYear?: string | Date;
  description?: string | null;
  isActive?: boolean;
}

export interface GenerationError {
  message: string;
  code?: string;
  fieldErrors?: {
    name?: string;
    startYear?: string;
    endYear?: string;
    description?: string;
  };
}
