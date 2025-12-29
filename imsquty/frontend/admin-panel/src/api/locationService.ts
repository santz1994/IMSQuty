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

export const locationService = {
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
}

export default locationService
