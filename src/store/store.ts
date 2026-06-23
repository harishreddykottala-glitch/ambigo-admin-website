import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import fleetReducer from './slices/fleetSlice';
import ridesReducer from './slices/ridesSlice';
import usersReducer from './slices/usersSlice';
import hospitalsReducer from './slices/hospitalsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fleet: fleetReducer,
    rides: ridesReducer,
    users: usersReducer,
    hospitals: hospitalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
