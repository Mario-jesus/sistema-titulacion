import type { IngressEgress } from '@entities/ingress-egress';
import { apiClient, API_ENDPOINTS } from '@shared/api';
import { logger } from '@shared/lib';
import type {
  ListIngressEgressParams,
  ListIngressEgressResponse,
} from '../model/types';

/**
 * Servicio para interactuar con la API de Ingreso y Egreso
 */
export const ingressEgressService = {
  /**
   * Obtiene la lista de ingreso y egreso con paginación y filtros
   */
  async list(
    params?: ListIngressEgressParams
  ): Promise<ListIngressEgressResponse> {
    try {
      logger.log('Obteniendo lista de ingreso y egreso...', params);

      const searchParams = new URLSearchParams();

      if (params?.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params?.sortBy && params?.sortOrder) {
        searchParams.append('sortBy', params.sortBy);
        searchParams.append('sortOrder', params.sortOrder);
      }
      if (params?.search) {
        searchParams.append('search', params.search);
      }
      if (params?.careerId) {
        searchParams.append('careerId', params.careerId);
      }
      if (params?.generationId) {
        searchParams.append('generationId', params.generationId);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${API_ENDPOINTS.INGRESS_EGRESS.LIST}?${queryString}`
        : API_ENDPOINTS.INGRESS_EGRESS.LIST;

      const response = await apiClient.get<ListIngressEgressResponse>(url);

      logger.log('Lista de ingreso y egreso obtenida exitosamente', {
        total: response.pagination.total,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener lista de ingreso y egreso:', error);
      throw error;
    }
  },

  /**
   * Obtiene los detalles de ingreso y egreso para una generación y carrera específica
   */
  async getByGenerationAndCareer(
    generationId: string,
    careerId: string
  ): Promise<IngressEgress> {
    try {
      logger.log('Obteniendo ingreso y egreso...', { generationId, careerId });

      const response = await apiClient.get<IngressEgress>(
        API_ENDPOINTS.INGRESS_EGRESS.DETAIL(generationId, careerId)
      );

      logger.log('Ingreso y egreso obtenido exitosamente', {
        generationId,
        careerId,
      });

      return response;
    } catch (error) {
      logger.error('Error al obtener ingreso y egreso:', error);
      throw error;
    }
  },
};
