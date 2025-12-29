import apiClient from './client'

export interface Location {
  id: number
  name: string
  code: string
  building: string
  floor: string
  room: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LocationListResponse {
  success: boolean
  data: Location[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface LocationResponse {
  success: boolean
  data: Location
  message: string
}

export const locationService = {
  getLocations: async (
    page = 1,
    perPage = 50,
    filters?: Record<string, any>,
  ): Promise<LocationListResponse> => {
    try {
      const response = await apiClient.get<LocationListResponse>(
        '/master-data/locations',
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

  getActiveLocations: async (): Promise<LocationListResponse> => {
    try {
      const response = await apiClient.get<LocationListResponse>(
        '/master-data/locations/active',
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getLocation: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiClient.get<LocationResponse>(
        `/master-data/locations/${id}`,
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default locationService
