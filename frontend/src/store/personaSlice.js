import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const generatePersonas = createAsyncThunk('personas/generate', async ({ datasetId, k }) => {
  const { data } = await api.post('/personas/generate', { dataset_id: datasetId, k });
  return data.data;
});

export const fetchPersonas = createAsyncThunk('personas/fetch', async (datasetId) => {
  const { data } = await api.get(`/personas/dataset/${datasetId}`);
  return data.data;
});

export const matchBrand = createAsyncThunk('personas/match', async (brandContext) => {
  const { data } = await api.post('/personas/match', { brand_context: brandContext });
  return data.data;
});

const personaSlice = createSlice({
  name: 'personas',
  initialState: { items: [], matches: [], generating: false, error: null },
  reducers: { clearMatches: (state) => { state.matches = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(generatePersonas.pending, (state) => { state.generating = true; })
      .addCase(generatePersonas.fulfilled, (state) => { state.generating = false; })
      .addCase(generatePersonas.rejected, (state, { error }) => { state.generating = false; state.error = error.message; })
      .addCase(fetchPersonas.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(matchBrand.fulfilled, (state, { payload }) => { state.matches = payload.matches; });
  },
});

export const { clearMatches } = personaSlice.actions;
export default personaSlice.reducer;
