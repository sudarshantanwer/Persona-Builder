import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const uploadDataset = createAsyncThunk('datasets/upload', async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
});

export const fetchDatasets = createAsyncThunk('datasets/fetchAll', async () => {
  const { data } = await api.get('/datasets');
  return data.data;
});

const datasetSlice = createSlice({
  name: 'datasets',
  initialState: { items: [], uploading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadDataset.pending, (state) => { state.uploading = true; })
      .addCase(uploadDataset.fulfilled, (state, { payload }) => { state.uploading = false; state.items.unshift(payload); })
      .addCase(uploadDataset.rejected, (state, { error }) => { state.uploading = false; state.error = error.message; })
      .addCase(fetchDatasets.fulfilled, (state, { payload }) => { state.items = payload; });
  },
});

export default datasetSlice.reducer;
