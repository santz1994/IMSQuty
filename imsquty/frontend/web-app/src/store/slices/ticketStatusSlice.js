import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const initialState = {
    statuses: [
        { id: 1, name: 'open', label: 'Open', color: '#FF9800' },
        { id: 2, name: 'in_progress', label: 'In Progress', color: '#2196F3' },
        { id: 3, name: 'pending_info', label: 'Pending Info', color: '#FF5722' },
        { id: 4, name: 'resolved', label: 'Resolved', color: '#4CAF50' },
        { id: 5, name: 'closed', label: 'Closed', color: '#9E9E9E' },
    ],
    loading: false,
    error: null,
};
export const fetchTicketStatuses = createAsyncThunk('ticketStatus/fetchStatuses', async (_, { rejectWithValue }) => {
    try {
        // Return static statuses - these don't change
        return {
            data: [
                { id: 1, name: 'open', label: 'Open', color: '#FF9800' },
                { id: 2, name: 'in_progress', label: 'In Progress', color: '#2196F3' },
                { id: 3, name: 'pending_info', label: 'Pending Info', color: '#FF5722' },
                { id: 4, name: 'resolved', label: 'Resolved', color: '#4CAF50' },
                { id: 5, name: 'closed', label: 'Closed', color: '#9E9E9E' },
            ],
        };
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket statuses');
    }
});
const ticketStatusSlice = createSlice({
    name: 'ticketStatus',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTicketStatuses.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchTicketStatuses.fulfilled, (state, action) => {
            state.loading = false;
            state.statuses = action.payload.data || [];
        })
            .addCase(fetchTicketStatuses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default ticketStatusSlice.reducer;
