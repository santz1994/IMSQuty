import apiClient from './client';
export const warrantyTypeService = {
    getWarrantyTypes: async (page = 1, perPage = 50, filters) => {
        try {
            const response = await apiClient.get('/master-data/warranty-types', {
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
    getActiveWarrantyTypes: async () => {
        try {
            const response = await apiClient.get('/master-data/warranty-types/active');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    getWarrantyType: async (id) => {
        try {
            const response = await apiClient.get(`/master-data/warranty-types/${id}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default warrantyTypeService;
