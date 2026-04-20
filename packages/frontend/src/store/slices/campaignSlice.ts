import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CampaignStatus } from '@mini-campaign-manager/shared';

interface CampaignFilterState {
    statusFilter: CampaignStatus | 'all';
    page: number;
    limit: number;
}

const initialState: CampaignFilterState = {
    statusFilter: 'all',
    page: 1,
    limit: 10,
};

export const campaignSlice = createSlice({
    name: 'campaign',
    initialState,
    reducers: {
        setStatusFilter: (state, action: PayloadAction<CampaignStatus | 'all'>) => {
            state.statusFilter = action.payload;
            state.page = 1; // Reset page when filter changes
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1;
        },
    },
});

export const { setStatusFilter, setPage, setLimit } = campaignSlice.actions;
