import type { IngressEgress } from '@entities/ingress-egress';
import type { SearchParams, ListResponse } from '@shared/lib/model';

export interface ListIngressEgressParams extends SearchParams {
  careerId?: string;
  generationId?: string;
}

export type ListIngressEgressResponse = ListResponse<IngressEgress>;

export interface IngressEgressError {
  message: string;
  code?: string;
}
