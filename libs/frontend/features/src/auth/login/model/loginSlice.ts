import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface LoginErrors {
  email?: string;
  password?: string;
}

export interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  submitError: string | null;
  fieldErrors: LoginErrors;
}

const initialState: LoginState = {
  email: '',
  password: '',
  isLoading: false,
  submitError: null,
  fieldErrors: {}
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      if (state.fieldErrors.email) {
        delete state.fieldErrors.email;
      }
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
      if (state.fieldErrors.password) {
        delete state.fieldErrors.password;
      }
    },
    setFieldError: (state, action: PayloadAction<{ field: keyof LoginErrors, error: string }>) => {
      state.fieldErrors[action.payload.field] = action.payload.error;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSubmitError: (state, action: PayloadAction<string | null>) => {
      state.submitError = action.payload;
    },
    clearFieldErrors: (state) => {
      state.fieldErrors = {};
    },
    clearSubmitError: (state) => {
      state.submitError = null;
    },
    resetForm: () => {
      return initialState;
    }
  }
});

export const {
  setEmail,
  setPassword,
  setFieldError,
  setIsLoading,
  setSubmitError,
  clearFieldErrors,
  clearSubmitError,
  resetForm,
} = loginSlice.actions;

export const loginReducer = loginSlice.reducer;
