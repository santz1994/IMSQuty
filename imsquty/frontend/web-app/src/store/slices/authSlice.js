import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../../api/authService';
const initialState = {
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    loading: false,
    error: null,
    isAuthenticated: authService.isAuthenticated(),
};
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await authService.login(email, password);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});
export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
});
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        })
            .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })
            .addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });
    },
});
export default authSlice.reducer;
