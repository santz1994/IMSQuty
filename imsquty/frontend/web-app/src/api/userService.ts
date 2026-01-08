import apiClient from './client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface User {
  id: string | number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  phone?: string
  avatar?: string
  status: string
  role?: string
  department?: string
  position?: string
  team?: string
  is_active?: boolean
  email_verified_at?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
  phone?: string
  department_id?: number | string
  team_id?: number | string
  position?: string
  role_ids?: number[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  department_id?: number | string
  team_id?: number | string
  position?: string
  role_ids?: number[]
  is_active?: boolean
}

export interface UserListResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
    }
  }
  message: string
}

export interface UserResponse {
  success: boolean
  data: User
  message: string
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
  department?: string
  status?: string
  sort?: string
  order?: 'asc' | 'desc'
}

// ============================================================================
// USER SERVICE API
// ============================================================================

const USER_API_BASE = '/users'

export const userService = {
  /**
   * Get list of users with pagination and filters
   */
  getUsers: async (params?: PaginationParams): Promise<UserListResponse> => {
    try {
      console.log('[USER-SERVICE] 📋 Fetching users...', params)

      const response = await apiClient.get<UserListResponse>(USER_API_BASE, {
        params: {
          page: params?.page || 1,
          per_page: params?.per_page || 15,
          search: params?.search,
          role: params?.role,
          department: params?.department,
          status: params?.status,
          sort: params?.sort || 'created_at',
          order: params?.order || 'desc',
        },
      })

      console.log('[USER-SERVICE] ✅ Users fetched:', response.data.data.users.length)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to fetch users:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  /**
   * Get single user by ID
   */
  getUserById: async (id: string | number): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] 👤 Fetching user:', id)

      const response = await apiClient.get<UserResponse>(`${USER_API_BASE}/${id}`)

      console.log('[USER-SERVICE] ✅ User fetched:', response.data.data.email)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to fetch user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  /**
   * Create new user
   */
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] ➕ Creating user:', data.email)

      const response = await apiClient.post<UserResponse>(USER_API_BASE, data)

      console.log('[USER-SERVICE] ✅ User created:', response.data.data.id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to create user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  },

  /**
   * Update existing user
   */
  updateUser: async (id: string | number, data: UpdateUserRequest): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] 🔄 Updating user:', id)

      const response = await apiClient.put<UserResponse>(`${USER_API_BASE}/${id}`, data)

      console.log('[USER-SERVICE] ✅ User updated:', response.data.data.id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to update user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[USER-SERVICE] 🗑️  Deleting user:', id)

      const response = await apiClient.delete(`${USER_API_BASE}/${id}`)

      console.log('[USER-SERVICE] ✅ User deleted:', id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to delete user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  /**
   * Activate user account
   */
  activateUser: async (id: string | number): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] ✅ Activating user:', id)

      const response = await apiClient.post<UserResponse>(`${USER_API_BASE}/${id}/activate`)

      console.log('[USER-SERVICE] ✅ User activated:', id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to activate user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to activate user')
    }
  },

  /**
   * Deactivate user account
   */
  deactivateUser: async (id: string | number): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] ⏸️  Deactivating user:', id)

      const response = await apiClient.post<UserResponse>(`${USER_API_BASE}/${id}/deactivate`)

      console.log('[USER-SERVICE] ✅ User deactivated:', id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to deactivate user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to deactivate user')
    }
  },

  /**
   * Restore deleted user
   */
  restoreUser: async (id: string | number): Promise<UserResponse> => {
    try {
      console.log('[USER-SERVICE] ♻️  Restoring user:', id)

      const response = await apiClient.post<UserResponse>(`${USER_API_BASE}/${id}/restore`)

      console.log('[USER-SERVICE] ✅ User restored:', id)
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to restore user:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to restore user')
    }
  },

  /**
   * Get user activity logs
   */
  getUserActivity: async (
    id: string | number,
    params?: { page?: number; per_page?: number }
  ): Promise<any> => {
    try {
      console.log('[USER-SERVICE] 📊 Fetching user activity:', id)

      const response = await apiClient.get(`${USER_API_BASE}/${id}/activity`, {
        params: {
          page: params?.page || 1,
          per_page: params?.per_page || 20,
        },
      })

      console.log('[USER-SERVICE] ✅ Activity fetched')
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to fetch activity:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch user activity')
    }
  },

  /**
   * Get user statistics
   */
  getUserStatistics: async (id: string | number): Promise<any> => {
    try {
      console.log('[USER-SERVICE] 📈 Fetching user statistics:', id)

      const response = await apiClient.get(`${USER_API_BASE}/${id}/statistics`)

      console.log('[USER-SERVICE] ✅ Statistics fetched')
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to fetch statistics:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
  },

  /**
   * Bulk delete users
   */
  bulkDelete: async (ids: (string | number)[]): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[USER-SERVICE] 🗑️  Bulk deleting users:', ids.length)

      const response = await apiClient.post(`${USER_API_BASE}/bulk-delete`, { ids })

      console.log('[USER-SERVICE] ✅ Bulk delete completed')
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to bulk delete:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to bulk delete users')
    }
  },

  /**
   * Export users to file (CSV/Excel)
   */
  exportUsers: async (params?: PaginationParams, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    try {
      console.log('[USER-SERVICE] 📥 Exporting users...', format)

      const response = await apiClient.get(`${USER_API_BASE}/export`, {
        params: {
          ...params,
          format,
        },
        responseType: 'blob',
      })

      console.log('[USER-SERVICE] ✅ Export completed')
      return response.data
    } catch (error: any) {
      console.error('[USER-SERVICE] ❌ Failed to export:', error.message)
      throw new Error('Failed to export users')
    }
  },
}

export default userService
