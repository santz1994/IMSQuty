import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { divisionService } from '../../api/divisionService';
const initialState = {
    divisions: [],
    currentDivision: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        perPage: 50,
        total: 0,
    },
};
export const fetchDivisions = createAsyncThunk('division/fetchDivisions', async ({ page = 1, perPage = 50, filters = {} } = {}, { rejectWithValue }) => {
    try {
        const response = await divisionService.getDivisions(page, perPage, filters);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch divisions');
    }
});
export const fetchActiveDivisions = createAsyncThunk('division/fetchActiveDivisions', async (_, { rejectWithValue }) => {
    try {
        const response = await divisionService.getActiveDivisions();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch active divisions');
    }
});
const divisionSlice = createSlice({
    name: 'division',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch all divisions
        builder
            .addCase(fetchDivisions.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchDivisions.fulfilled, (state, action) => {
            state.loading = false;
            state.divisions = action.payload.data || [];
            if (action.payload.meta) {
                state.pagination = {
                    page: action.payload.meta.current_page,
                    perPage: action.payload.meta.per_page,
                    total: action.payload.meta.total,
                };
            }
        })
            .addCase(fetchDivisions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch active divisions
        builder
            .addCase(fetchActiveDivisions.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchActiveDivisions.fulfilled, (state, action) => {
            state.loading = false;
            state.divisions = action.payload.data || [];
        })
            .addCase(fetchActiveDivisions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default divisionSlice.reducer;
