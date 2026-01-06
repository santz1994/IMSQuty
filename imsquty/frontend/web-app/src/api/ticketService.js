import apiClient from './client';
export const ticketService = {
    getTickets: async (page = 1, perPage = 10, filters) => {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            ...Object.fromEntries(Object.entries(filters || {})
                .filter(([, v]) => v !== null && v !== undefined)
                .map(([k, v]) => [k, v.toString()])),
        });
        const response = await apiClient.get(`/tickets?${params}`);
        return response.data;
    },
    getTicket: async (id) => {
        const response = await apiClient.get(`/tickets/${id}`);
        return response.data;
    },
    createTicket: async (data) => {
        const response = await apiClient.post('/tickets', data);
        return response.data;
    },
    updateTicket: async (id, data) => {
        const response = await apiClient.put(`/tickets/${id}`, data);
        return response.data;
    },
    deleteTicket: async (id) => {
        const response = await apiClient.delete(`/tickets/${id}`);
        return response.data;
    },
    searchTickets: async (query) => {
        const response = await apiClient.get(`/tickets/search?q=${query}`);
        return response.data;
    },
    assignTicket: async (ticketId, userId) => {
        const response = await apiClient.post(`/tickets/${ticketId}/assign`, { assigned_to: userId });
        return response.data;
    },
};
