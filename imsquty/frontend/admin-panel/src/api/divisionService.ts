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

export const divisionService = {
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
}

export default divisionService
