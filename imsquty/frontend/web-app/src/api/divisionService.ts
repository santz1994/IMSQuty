import apiClient from './client'

export interface Division {
  id: number
  name: string
  code: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DivisionListResponse {
  success: boolean
  data: Division[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface DivisionResponse {
  success: boolean
  data: Division
  message: string
}

export const divisionService = {
  getDivisions: async (
    page = 1,
    perPage = 50,
    filters?: Record<string, any>,
  ): Promise<DivisionListResponse> => {
    try {
      const response = await apiClient.get<DivisionListResponse>(
        '/master-data/divisions',
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

  getActiveDivisions: async (): Promise<DivisionListResponse> => {
    try {
      const response = await apiClient.get<DivisionListResponse>(
        '/master-data/divisions/active',
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getDivision: async (id: number): Promise<DivisionResponse> => {
    try {
      const response = await apiClient.get<DivisionResponse>(
        `/master-data/divisions/${id}`,
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default divisionService
