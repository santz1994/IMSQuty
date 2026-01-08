/**
 * useUsers Hook
 * React hook for user management
 */

import { useCallback, useEffect, useState } from 'react'
import { User } from '../services/AuthService'
import { PaginationParams } from '../services/BaseService'

interface UseUsersResult {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: (params?: PaginationParams) => Promise<void>
  getUserById: (id: number | string) => Promise<User | null>
  createUser: (data: Partial<User>) => Promise<User | null>
  updateUser: (id: number | string, data: Partial<User>) => Promise<User | null>
  deleteUser: (id: number | string) => Promise<boolean>
  activateUser: (id: number | string) => Promise<boolean>
  deactivateUser: (id: number | string) => Promise<boolean>
  refreshUsers: () => Promise<void>
}

/**
 * Main users hook
 */
export function useUsers(autoFetch: boolean = false, params?: PaginationParams): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'john.doe',
          email: 'john.doe@quty.co.id',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+62812345678',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          username: 'jane.smith',
          email: 'jane.smith@quty.co.id',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+62812345679',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setUsers(mockUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getUserById = useCallback(async (id: number | string): Promise<User | null> => {
    setError(null)
    try {
      // Mock implementation
      return users.find(u => u.id === id) || null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [users])

  const createUser = useCallback(async (data: Partial<User>): Promise<User | null> => {
    setLoading(true)
    setError(null)
    try {
      // Mock implementation
      const newUser: User = {
        id: Date.now(),
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUsers(prev => [newUser, ...prev])
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: number | string, data: Partial<User>): Promise<User | null> => {
    setLoading(true)
    setError(null)
    try {
      // Mock implementation
      const updatedUser = users.find(u => u.id === id)
      if (updatedUser) {
        const updated = { ...updatedUser, ...data, updated_at: new Date().toISOString() }
        setUsers(prev => prev.map(u => u.id === id ? updated : u))
        return updated
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [users])

  const deleteUser = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      // Mock implementation
      setUsers(prev => prev.filter(u => u.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const activateUser = useCallback(async (id: number | string): Promise<boolean> => {
    return updateUser(id, { status: 'active' }).then(u => !!u)
  }, [updateUser])

  const deactivateUser = useCallback(async (id: number | string): Promise<boolean> => {
    return updateUser(id, { status: 'inactive' }).then(u => !!u)
  }, [updateUser])

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
