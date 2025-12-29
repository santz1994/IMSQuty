import apiClient from './client'

export interface WarrantyType {
  id: number
  name: string
  code: string
  duration_months: number
  coverage_description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WarrantyTypeListResponse {
  success: boolean
  data: WarrantyType[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface WarrantyTypeResponse {
  success: boolean
  data: WarrantyType
  message: string
}

export const warrantyTypeService = {
  getWarrantyTypes: async (
    page = 1,
    perPage = 50,
    filters?: Record<string, any>,
  ): Promise<WarrantyTypeListResponse> => {
    try {
      const response = await apiClient.get<WarrantyTypeListResponse>(
        '/master-data/warranty-types',
        {
          params: {
            page,
            per_page: perPage,
            ...filters,
          },
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getActiveWarrantyTypes: async (): Promise<WarrantyTypeListResponse> => {
    try {
      const response = await apiClient.get<WarrantyTypeListResponse>(
        '/master-data/warranty-types/active',
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getWarrantyType: async (id: number): Promise<WarrantyTypeResponse> => {
    try {
      const response = await apiClient.get<WarrantyTypeResponse>(
        `/master-data/warranty-types/${id}`,
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default warrantyTypeService
