import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ticketService } from '../../api/ticketService';
const initialState = {
    tickets: [],
    currentTicket: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        perPage: 10,
        total: 0,
    },
};
export const fetchTickets = createAsyncThunk('ticket/fetchTickets', async ({ page = 1, perPage = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
        const response = await ticketService.getTickets(page, perPage, filters);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
    }
});
export const fetchTicket = createAsyncThunk('ticket/fetchTicket', async (id, { rejectWithValue }) => {
    try {
        const response = await ticketService.getTicket(id);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket');
    }
});
export const createTicket = createAsyncThunk('ticket/createTicket', async (data, { rejectWithValue }) => {
    try {
        const response = await ticketService.createTicket(data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create ticket');
    }
});
export const updateTicket = createAsyncThunk('ticket/updateTicket', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await ticketService.updateTicket(id, data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update ticket');
    }
});
export const deleteTicket = createAsyncThunk('ticket/deleteTicket', async (id, { rejectWithValue }) => {
    try {
        await ticketService.deleteTicket(id);
        return id;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete ticket');
    }
});
const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {
        clearCurrentTicket: (state) => {
            state.currentTicket = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchTickets.fulfilled, (state, action) => {
            state.loading = false;
            state.tickets = action.payload.data;
            state.pagination = {
                page: action.payload.meta.current_page,
                perPage: action.payload.meta.per_page,
                total: action.payload.meta.total,
            };
        })
            .addCase(fetchTickets.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(fetchTicket.pending, (state) => {
            state.loading = true;
        })
            .addCase(fetchTicket.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTicket = action.payload;
        })
            .addCase(fetchTicket.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(createTicket.fulfilled, (state, action) => {
            state.tickets.push(action.payload);
        })
            .addCase(updateTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.tickets[index] = action.payload;
            }
            state.currentTicket = action.payload;
        })
            .addCase(deleteTicket.fulfilled, (state, action) => {
            state.tickets = state.tickets.filter((t) => t.id !== action.payload);
        });
    },
});
export const { clearCurrentTicket, clearError } = ticketSlice.actions;
export default ticketSlice.reducer;
