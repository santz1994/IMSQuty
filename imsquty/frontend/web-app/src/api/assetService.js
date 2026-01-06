import apiClient from './client';
export const assetService = {
    getAssets: async (page = 1, perPage = 10, filters) => {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            ...Object.fromEntries(Object.entries(filters || {})
                .filter(([, v]) => v !== null && v !== undefined)
                .map(([k, v]) => [k, v.toString()])),
        });
        const response = await apiClient.get(`/assets?${params}`);
        return response.data;
    },
    getAsset: async (id) => {
        const response = await apiClient.get(`/assets/${id}`);
        return response.data;
    },
    createAsset: async (data) => {
        const response = await apiClient.post('/assets', data);
        return response.data;
    },
    updateAsset: async (id, data) => {
        const response = await apiClient.put(`/assets/${id}`, data);
        return response.data;
    },
    deleteAsset: async (id) => {
        const response = await apiClient.delete(`/assets/${id}`);
        return response.data;
    },
    searchAssets: async (query) => {
        const response = await apiClient.get(`/assets/search?q=${query}`);
        return response.data;
    },
};
