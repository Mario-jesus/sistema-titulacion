import type { Quota } from '@entities/quota';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export interface ListQuotasParams extends SearchParams {
  careerId?: string;
  generationId?: string;
}

export type ListQuotasResponse = ListResponse<Quota>;

export interface CreateQuotaRequest {
  generationId: string;
  careerId: string;
  newAdmissionQuotas: number;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateQuotaRequest {
  generationId?: string;
  careerId?: string;
  newAdmissionQuotas?: number;
  description?: string | null;
  isActive?: boolean;
}

export interface QuotaError {
  message: string;
  code?: string;
  fieldErrors?: {
    generationId?: string;
    careerId?: string;
    newAdmissionQuotas?: string;
    description?: string;
  };
}
