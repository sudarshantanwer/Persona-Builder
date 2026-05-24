import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  localStorage.setItem('token', data.data.token);
  return data.data;
});

export const register = createAsyncThunk('auth/register', async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  localStorage.setItem('token', data.data.token);
  return data.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload.user; state.token = payload.token; })
      .addCase(login.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })
      .addCase(register.fulfilled, (state, { payload }) => { state.user = payload.user; state.token = payload.token; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
