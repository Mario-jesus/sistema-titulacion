import { createSlice } from '@reduxjs/toolkit';
import type { IngressEgress } from '@entities/ingress-egress';
import type { PaginationData } from '@shared/lib/model';
import {
  listIngressEgressThunk,
  getIngressEgressByGenerationAndCareerThunk,
} from './ingressEgressThunks';

export interface IngressEgressState {
  // Lista de ingreso y egreso
  ingressEgressList: IngressEgress[];
  pagination: PaginationData | null;
  isLoadingList: boolean;
  listError: string | null;

  // Ingreso y egreso actual (detalle)
  currentIngressEgress: IngressEgress | null;
  isLoadingDetail: boolean;
  detailError: string | null;
}

const initialState: IngressEgressState = {
  ingressEgressList: [],
  pagination: null,
  isLoadingList: false,
  listError: null,

  currentIngressEgress: null,
  isLoadingDetail: false,
  detailError: null,
};

const ingressEgressSlice = createSlice({
  name: 'ingressEgress',
  initialState,
  reducers: {
    clearListError: (state) => {
      state.listError = null;
    },
    clearDetailError: (state) => {
      state.detailError = null;
    },
    clearCurrentIngressEgress: (state) => {
      state.currentIngressEgress = null;
      state.detailError = null;
    },
    clearAllErrors: (state) => {
      state.listError = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LIST ==========
    builder.addCase(listIngressEgressThunk.pending, (state) => {
      state.isLoadingList = true;
      state.listError = null;
    });
    builder.addCase(listIngressEgressThunk.fulfilled, (state, action) => {
      state.isLoadingList = false;
      state.ingressEgressList = action.payload.data;
      state.pagination = action.payload.pagination;
      state.listError = null;
    });
    builder.addCase(listIngressEgressThunk.rejected, (state, action) => {
      state.isLoadingList = false;
      state.listError =
        action.payload || 'Error al obtener lista de ingreso y egreso';
    });

    // ========== GET BY GENERATION AND CAREER ==========
    builder.addCase(
      getIngressEgressByGenerationAndCareerThunk.pending,
      (state) => {
        state.isLoadingDetail = true;
        state.detailError = null;
      }
    );
    builder.addCase(
      getIngressEgressByGenerationAndCareerThunk.fulfilled,
      (state, action) => {
        state.isLoadingDetail = false;
        state.currentIngressEgress = action.payload;
        state.detailError = null;
      }
    );
    builder.addCase(
      getIngressEgressByGenerationAndCareerThunk.rejected,
      (state, action) => {
        state.isLoadingDetail = false;
        state.detailError =
          action.payload || 'Error al obtener ingreso y egreso';
      }
    );
  },
});

export const {
  clearListError,
  clearDetailError,
  clearCurrentIngressEgress,
  clearAllErrors,
} = ingressEgressSlice.actions;

export const ingressEgressReducer = ingressEgressSlice.reducer;
