import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserPublic } from '@mini-campaign-manager/shared';

interface AuthState {
    user: UserPublic | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: UserPublic; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        setUser: (state, action: PayloadAction<UserPublic>) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
