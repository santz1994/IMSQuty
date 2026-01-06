import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { locationService } from '../../api/locationService';
const initialState = {
    locations: [],
    currentLocation: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        perPage: 50,
        total: 0,
    },
};
export const fetchLocations = createAsyncThunk('location/fetchLocations', async ({ page = 1, perPage = 50, filters = {} } = {}, { rejectWithValue }) => {
    try {
        const response = await locationService.getLocations(page, perPage, filters);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations');
    }
});
export const fetchActiveLocations = createAsyncThunk('location/fetchActiveLocations', async (_, { rejectWithValue }) => {
    try {
        const response = await locationService.getActiveLocations();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch active locations');
    }
});
const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch all locations
        builder
            .addCase(fetchLocations.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchLocations.fulfilled, (state, action) => {
            state.loading = false;
            state.locations = action.payload.data || [];
            if (action.payload.meta) {
                state.pagination = {
                    page: action.payload.meta.current_page,
                    perPage: action.payload.meta.per_page,
                    total: action.payload.meta.total,
                };
            }
        })
            .addCase(fetchLocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch active locations
        builder
            .addCase(fetchActiveLocations.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchActiveLocations.fulfilled, (state, action) => {
            state.loading = false;
            state.locations = action.payload.data || [];
        })
            .addCase(fetchActiveLocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default locationSlice.reducer;
