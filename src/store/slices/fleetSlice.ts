import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listAllDrivers, listUnverifiedDrivers } from '../../utils/admin-api';

interface FleetState {
  drivers: any[];
  unverifiedDrivers: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  unverifiedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FleetState = {
  drivers: [],
  unverifiedDrivers: [],
  status: 'idle',
  unverifiedStatus: 'idle',
  error: null,
};

export const fetchDrivers = createAsyncThunk('fleet/fetchDrivers', async () => {
  const response = await listAllDrivers();
  return response;
});

export const fetchUnverifiedDrivers = createAsyncThunk('fleet/fetchUnverifiedDrivers', async () => {
  const response = await listUnverifiedDrivers();
  return response;
});

export const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.drivers = action.payload?.data || action.payload || [];
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load drivers';
      })
      .addCase(fetchUnverifiedDrivers.pending, (state) => {
        state.unverifiedStatus = 'loading';
      })
      .addCase(fetchUnverifiedDrivers.fulfilled, (state, action) => {
        state.unverifiedStatus = 'succeeded';
        state.unverifiedDrivers = action.payload?.data || action.payload || [];
      })
      .addCase(fetchUnverifiedDrivers.rejected, (state, action) => {
        state.unverifiedStatus = 'failed';
        state.error = action.error.message || 'Failed to load unverified drivers';
      });
  },
});

export default fleetSlice.reducer;
