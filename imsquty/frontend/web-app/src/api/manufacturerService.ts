import apiClient from './client'

export interface Manufacturer {
  id: number
  name: string
  code: string
  contact_person: string
  email: string
  phone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ManufacturerListResponse {
  success: boolean
  data: Manufacturer[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface ManufacturerResponse {
  success: boolean
  data: Manufacturer
  message: string
}

export const manufacturerService = {
  getManufacturers: async (
    page = 1,
    perPage = 50,
    filters?: Record<string, any>,
  ): Promise<ManufacturerListResponse> => {
    try {
      const response = await apiClient.get<ManufacturerListResponse>(
        '/master-data/manufacturers',
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

  getActiveManufacturers: async (): Promise<ManufacturerListResponse> => {
    try {
      const response = await apiClient.get<ManufacturerListResponse>(
        '/master-data/manufacturers/active',
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getManufacturer: async (id: number): Promise<ManufacturerResponse> => {
    try {
      const response = await apiClient.get<ManufacturerResponse>(
        `/master-data/manufacturers/${id}`,
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default manufacturerService
