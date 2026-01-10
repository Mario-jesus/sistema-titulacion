import { configureStore } from '@reduxjs/toolkit';
import {
  loginReducer,
  authReducer,
  loginThunk,
  logoutThunk,
  checkAuthThunk,
} from '@features/auth';
import { generationsReducer } from '@features/generations';
import { graduationOptionsReducer } from '@features/graduation-options';
import { careersReducer } from '@features/careers';
import { modalitiesReducer } from '@features/modalities';
import { userReducer, setUser, clearUser } from '@entities/user';

export const store = configureStore({
  reducer: {
    user: userReducer,
    login: loginReducer,
    auth: authReducer,
    generations: generationsReducer,
    graduationOptions: graduationOptionsReducer,
    careers: careersReducer,
    modalities: modalitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      (storeAPI: any) => (next: any) => (action: any) => {
        const result = next(action);

        // Sincronizar el estado del usuario cuando los thunks se completan
        if (loginThunk.fulfilled.match(action)) {
          storeAPI.dispatch(setUser(action.payload));
        }

        if (
          logoutThunk.fulfilled.match(action) ||
          logoutThunk.rejected.match(action)
        ) {
          storeAPI.dispatch(clearUser());
        }

        if (checkAuthThunk.fulfilled.match(action)) {
          storeAPI.dispatch(setUser(action.payload));
        }

        if (checkAuthThunk.rejected.match(action)) {
          storeAPI.dispatch(clearUser());
        }

        return result;
      }
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
