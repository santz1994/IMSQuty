import apiClient from './client';
export const divisionService = {
    getDivisions: async (page = 1, perPage = 50, filters) => {
        try {
            const response = await apiClient.get('/master-data/divisions', {
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
    getActiveDivisions: async () => {
        try {
            const response = await apiClient.get('/master-data/divisions/active');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    getDivision: async (id) => {
        try {
            const response = await apiClient.get(`/master-data/divisions/${id}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default divisionService;
