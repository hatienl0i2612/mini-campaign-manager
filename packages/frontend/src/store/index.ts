import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { campaignSlice } from './slices/campaignSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        campaign: campaignSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
