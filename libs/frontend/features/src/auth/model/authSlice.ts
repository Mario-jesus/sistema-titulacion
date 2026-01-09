import { createSlice } from '@reduxjs/toolkit';
import {
  loginThunk,
  logoutThunk,
  checkAuthThunk,
  refreshTokenThunk,
} from './authThunks';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  isCheckingAuth: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ========== LOGIN ==========
    builder.addCase(loginThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Error al iniciar sesión';
    });

    // ========== LOGOUT ==========
    builder.addCase(logoutThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(logoutThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || null;
    });

    // ========== CHECK AUTH ==========
    builder.addCase(checkAuthThunk.pending, (state) => {
      state.isCheckingAuth = true;
      state.error = null;
    });
    builder.addCase(checkAuthThunk.fulfilled, (state) => {
      state.isCheckingAuth = false;
      state.error = null;
    });
    builder.addCase(checkAuthThunk.rejected, (state, action) => {
      state.isCheckingAuth = false;
      state.error = action.payload || null;
    });

    // ========== REFRESH TOKEN ==========
    builder.addCase(refreshTokenThunk.pending, (state) => {
      state.error = null;
    });
    builder.addCase(refreshTokenThunk.fulfilled, (state) => {
      state.error = null;
    });
    builder.addCase(refreshTokenThunk.rejected, (state, action) => {
      state.error = action.payload || 'Error al refrescar token';
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
