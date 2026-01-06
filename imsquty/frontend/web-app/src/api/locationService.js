import apiClient from './client';
export const locationService = {
    getLocations: async (page = 1, perPage = 50, filters) => {
        try {
            const response = await apiClient.get('/master-data/locations', {
                params: {
                    page,
                    per_page: perPage,
                    ...filters,
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    getActiveLocations: async () => {
        try {
            const response = await apiClient.get('/master-data/locations/active');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    getLocation: async (id) => {
        try {
            const response = await apiClient.get(`/master-data/locations/${id}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default locationService;
