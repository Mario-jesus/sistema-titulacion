import type { Modality } from '@entities/modality';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export type ListModalitiesParams = SearchParams;

export type ListModalitiesResponse = ListResponse<Modality>;

export interface CreateModalityRequest {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateModalityRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ModalityError {
  message: string;
  code?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
  };
}
