import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listHospitals } from '../../utils/admin-api';

interface HospitalsState {
  hospitals: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: HospitalsState = {
  hospitals: [],
  status: 'idle',
  error: null,
};

export const fetchHospitals = createAsyncThunk('hospitals/fetchHospitals', async () => {
  const response = await listHospitals();
  return response;
});

export const hospitalsSlice = createSlice({
  name: 'hospitals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHospitals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.hospitals = action.payload || [];
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch hospitals';
      });
  },
});

export default hospitalsSlice.reducer;
