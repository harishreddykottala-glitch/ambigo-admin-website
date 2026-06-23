import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listOngoingRides, listCompletedRides } from '../../utils/admin-api';

interface RidesState {
  liveRides: any[];
  completedRides: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  completedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RidesState = {
  liveRides: [],
  completedRides: [],
  status: 'idle',
  completedStatus: 'idle',
  error: null,
};

export const fetchOngoingRides = createAsyncThunk('rides/fetchOngoingRides', async () => {
  const response = await listOngoingRides();
  return response;
});

export const fetchCompletedRides = createAsyncThunk('rides/fetchCompletedRides', async () => {
  const response = await listCompletedRides();
  return response;
});

export const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    // We can add reducers for WebSocket updates here
    addLiveRide: (state, action) => {
      state.liveRides.push(action.payload);
    },
    updateLiveRide: (state, action) => {
      const index = state.liveRides.findIndex((r) => r.id === action.payload.id || r._id === action.payload._id);
      if (index !== -1) {
        state.liveRides[index] = { ...state.liveRides[index], ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOngoingRides.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOngoingRides.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.liveRides = action.payload || [];
      })
      .addCase(fetchOngoingRides.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch ongoing rides';
      })
      .addCase(fetchCompletedRides.pending, (state) => {
        state.completedStatus = 'loading';
      })
      .addCase(fetchCompletedRides.fulfilled, (state, action) => {
        state.completedStatus = 'succeeded';
        state.completedRides = action.payload || [];
      })
      .addCase(fetchCompletedRides.rejected, (state, action) => {
        state.completedStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch completed rides';
      });
  },
});

export const { addLiveRide, updateLiveRide } = ridesSlice.actions;
export default ridesSlice.reducer;
