import apiClient from './client';
export const manufacturerService = {
    getManufacturers: async (page = 1, perPage = 50, filters) => {
        try {
            const response = await apiClient.get('/master-data/manufacturers', {
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
    getActiveManufacturers: async () => {
        try {
            const response = await apiClient.get('/master-data/manufacturers/active');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    getManufacturer: async (id) => {
        try {
            const response = await apiClient.get(`/master-data/manufacturers/${id}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default manufacturerService;
