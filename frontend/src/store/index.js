import { configureStore } from '@reduxjs/toolkit';
import datasetReducer from './datasetSlice';
import personaReducer from './personaSlice';
import campaignReducer from './campaignSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    datasets: datasetReducer,
    personas: personaReducer,
    campaigns: campaignReducer,
    auth: authReducer,
  },
});
