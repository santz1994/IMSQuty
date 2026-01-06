import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const initialState = {
    priorities: [
        { id: 1, name: 'low', label: 'Low', order: 1 },
        { id: 2, name: 'medium', label: 'Medium', order: 2 },
        { id: 3, name: 'high', label: 'High', order: 3 },
        { id: 4, name: 'critical', label: 'Critical', order: 4 },
    ],
    loading: false,
    error: null,
};
export const fetchTicketPriorities = createAsyncThunk('ticketPriority/fetchPriorities', async (_, { rejectWithValue }) => {
    try {
        // Return static priorities - these don't change
        return {
            data: [
                { id: 1, name: 'low', label: 'Low', order: 1 },
                { id: 2, name: 'medium', label: 'Medium', order: 2 },
                { id: 3, name: 'high', label: 'High', order: 3 },
                { id: 4, name: 'critical', label: 'Critical', order: 4 },
            ],
        };
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket priorities');
    }
});
const ticketPrioritySlice = createSlice({
    name: 'ticketPriority',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTicketPriorities.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchTicketPriorities.fulfilled, (state, action) => {
            state.loading = false;
            state.priorities = action.payload.data || [];
        })
            .addCase(fetchTicketPriorities.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default ticketPrioritySlice.reducer;
