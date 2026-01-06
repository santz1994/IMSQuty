import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { warrantyTypeService } from '../../api/warrantyTypeService';
const initialState = {
    warrantyTypes: [],
    currentWarrantyType: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        perPage: 50,
        total: 0,
    },
};
export const fetchWarrantyTypes = createAsyncThunk('warrantyType/fetchWarrantyTypes', async ({ page = 1, perPage = 50, filters = {} } = {}, { rejectWithValue }) => {
    try {
        const response = await warrantyTypeService.getWarrantyTypes(page, perPage, filters);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch warranty types');
    }
});
export const fetchActiveWarrantyTypes = createAsyncThunk('warrantyType/fetchActiveWarrantyTypes', async (_, { rejectWithValue }) => {
    try {
        const response = await warrantyTypeService.getActiveWarrantyTypes();
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch active warranty types');
    }
});
const warrantyTypeSlice = createSlice({
    name: 'warrantyType',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch all warranty types
        builder
            .addCase(fetchWarrantyTypes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchWarrantyTypes.fulfilled, (state, action) => {
            state.loading = false;
            state.warrantyTypes = action.payload.data || [];
            if (action.payload.meta) {
                state.pagination = {
                    page: action.payload.meta.current_page,
                    perPage: action.payload.meta.per_page,
                    total: action.payload.meta.total,
                };
            }
        })
            .addCase(fetchWarrantyTypes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Fetch active warranty types
        builder
            .addCase(fetchActiveWarrantyTypes.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchActiveWarrantyTypes.fulfilled, (state, action) => {
            state.loading = false;
            state.warrantyTypes = action.payload.data || [];
        })
            .addCase(fetchActiveWarrantyTypes.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default warrantyTypeSlice.reducer;
