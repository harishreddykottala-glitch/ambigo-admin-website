import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('admin_token') || null,
  role: localStorage.getItem('admin_role') || null,
  username: localStorage.getItem('admin_username') || null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{token: string, role: string, username?: string}>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.username = action.payload.username || null;
      state.isAuthenticated = true;
      localStorage.setItem('admin_token', action.payload.token);
      localStorage.setItem('admin_role', action.payload.role);
      if (action.payload.username) {
        localStorage.setItem('admin_username', action.payload.username);
      }
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.username = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      localStorage.removeItem('admin_username');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
