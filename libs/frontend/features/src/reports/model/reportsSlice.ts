import { createSlice } from '@reduxjs/toolkit';
import { generateReportThunk } from './reportsThunks';
import type { ReportResponse } from './types';

export interface ReportsState {
  // Reporte actual
  currentReport: ReportResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  currentReport: null,
  isLoading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReport: (state) => {
      state.currentReport = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ========== GENERATE REPORT ==========
    builder.addCase(generateReportThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(generateReportThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentReport = action.payload;
      state.error = null;
    });
    builder.addCase(generateReportThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Error al generar reporte';
    });
  },
});

export const { clearReport, clearError } = reportsSlice.actions;

export const reportsReducer = reportsSlice.reducer;
