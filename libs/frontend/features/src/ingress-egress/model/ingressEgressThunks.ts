import { createAsyncThunk } from '@reduxjs/toolkit';
import type { IngressEgress } from '@entities/ingress-egress';
import { logger } from '@shared/lib/logger';
import { ingressEgressService } from '../api/ingressEgressService';
import type {
  ListIngressEgressParams,
  ListIngressEgressResponse,
} from './types';

/**
 * Thunks para la gestión de ingreso y egreso
 */

// ========== LIST ==========
export const listIngressEgressThunk = createAsyncThunk<
  ListIngressEgressResponse,
  ListIngressEgressParams | undefined,
  { rejectValue: string }
>('ingressEgress/list', async (params, { rejectWithValue }) => {
  try {
    const response = await ingressEgressService.list(params);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener lista de ingreso y egreso';
    logger.error('Error en listIngressEgressThunk:', error);
    return rejectWithValue(message);
  }
});

// ========== GET BY GENERATION AND CAREER ==========
export const getIngressEgressByGenerationAndCareerThunk = createAsyncThunk<
  IngressEgress,
  { generationId: string; careerId: string },
  { rejectValue: string }
>(
  'ingressEgress/getByGenerationAndCareer',
  async ({ generationId, careerId }, { rejectWithValue }) => {
    try {
      const ingressEgress = await ingressEgressService.getByGenerationAndCareer(
        generationId,
        careerId
      );
      return ingressEgress;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error desconocido al obtener ingreso y egreso';
      logger.error(
        'Error en getIngressEgressByGenerationAndCareerThunk:',
        error
      );
      return rejectWithValue(message);
    }
  }
);
