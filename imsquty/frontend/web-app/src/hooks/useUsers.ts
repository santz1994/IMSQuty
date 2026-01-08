/**
 * useUsers Hook
 * React hook for user management - REAL DATABASE ONLY
 */

import { useCallback, useEffect, useState } from 'react'
import userService, {
  CreateUserRequest,
  PaginationParams,
  UpdateUserRequest,
  User
} from '../api/userService'

interface UseUsersResult {
  users: User[]
  loading: boolean
  error: string | null
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  } | null
  fetchUsers: (params?: PaginationParams) => Promise<void>
  getUserById: (id: number | string) => Promise<User | null>
  createUser: (data: CreateUserRequest) => Promise<User | null>
  updateUser: (id: number | string, data: UpdateUserRequest) => Promise<User | null>
  deleteUser: (id: number | string) => Promise<boolean>
  activateUser: (id: number | string) => Promise<boolean>
  deactivateUser: (id: number | string) => Promise<boolean>
  refreshUsers: () => Promise<void>
}

/**
 * Main users hook - uses REAL API CALLS to user-service
 */
export function useUsers(autoFetch: boolean = false, params?: PaginationParams): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    current_page: number
    per_page: number
    total: number
    total_pages: number
  } | null>(null)

  const fetchUsers = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] 📋 Fetching users from API...')
      const response = await userService.getUsers(fetchParams || params)

      setUsers(response.data.users)
      setPagination(response.data.pagination)
      console.log('[useUsers] ✅ Users loaded:', response.data.users.length)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
    } finally {
      setLoading(false)
    }
  }, [params])

  const getUserById = useCallback(async (id: number | string): Promise<User | null> => {
    setError(null)
    try {
      console.log('[useUsers] 👤 Fetching user:', id)
      const response = await userService.getUserById(id)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return null
    }
  }, [])

  const createUser = useCallback(async (data: CreateUserRequest): Promise<User | null> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] ➕ Creating user:', data.email)
      const response = await userService.createUser(data)

      // Refresh users list
      await fetchUsers()
      console.log('[useUsers] ✅ User created:', response.data.id)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: number | string, data: UpdateUserRequest): Promise<User | null> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] 🔄 Updating user:', id)
      const response = await userService.updateUser(id, data)

      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? response.data : u))
      console.log('[useUsers] ✅ User updated:', id)
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] 🗑️  Deleting user:', id)
      await userService.deleteUser(id)

      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== id))
      console.log('[useUsers] ✅ User deleted:', id)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const activateUser = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] ✅ Activating user:', id)
      const response = await userService.activateUser(id)

      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? response.data : u))
      console.log('[useUsers] ✅ User activated:', id)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to activate user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deactivateUser = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useUsers] ⏸️  Deactivating user:', id)
      const response = await userService.deactivateUser(id)

      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? response.data : u))
      console.log('[useUsers] ✅ User deactivated:', id)
      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to deactivate user'
      setError(errorMsg)
      console.error('[useUsers] ❌ Error:', errorMsg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUsers = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (autoFetch) {
      fetchUsers()
    }
  }, [autoFetch, fetchUsers])

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    refreshUsers,
  }
}

export default useUsers
