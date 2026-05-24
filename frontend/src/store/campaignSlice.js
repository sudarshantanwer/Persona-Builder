import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createCampaign = createAsyncThunk('campaigns/create', async (campaignData) => {
  const { data } = await api.post('/campaigns', campaignData);
  return data.data;
});

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async () => {
  const { data } = await api.get('/campaigns');
  return data.data;
});

export const activateCampaign = createAsyncThunk('campaigns/activate', async (id) => {
  const { data } = await api.post(`/campaigns/${id}/activate`);
  return data.data;
});

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCampaign.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(fetchCampaigns.fulfilled, (state, { payload }) => { state.items = payload; })
      .addCase(activateCampaign.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((c) => c.id === payload.campaignId);
        if (idx >= 0) state.items[idx].status = 'active';
      });
  },
});

export default campaignSlice.reducer;
