/**
 * useAuth Hook
 * React hook for authentication and user management
 */

import { useState, useEffect, useCallback } from 'react'
import authRepository from '../repositories/AuthRepository'
import { User, LoginCredentials, RegisterData, Permission, Role } from '../services/AuthService'

interface UseAuthResult {
  // State
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  permissions: Permission[]
  roles: Role[]
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  changePassword: (current: string, newPassword: string, confirm: string) => Promise<boolean>
  uploadAvatar: (file: File) => Promise<boolean>
  checkPermission: (permission: string) => Promise<boolean>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const isAuth = authRepository.isAuthenticated()
        setIsAuthenticated(isAuth)

        if (isAuth) {
          // Try to get cached user first
          const cachedUser = authRepository.getCachedUser()
          if (cachedUser) {
            setUser(cachedUser)
          }

          // Then fetch fresh user data
          const freshUser = await authRepository.getCurrentUser()
          if (freshUser) {
            setUser(freshUser)
            
            // Load permissions and roles
            const userPerms = await authRepository.getUserPermissions()
            const userRoles = await authRepository.getUserRoles()
            
            if (userPerms) setPermissions(userPerms)
            if (userRoles) setRoles(userRoles)
          } else {
            // Token invalid, clear auth
            await authRepository.clearAuthData()
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize auth')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const authData = await authRepository.login(credentials)
      if (authData) {
        setUser(authData.user)
        setIsAuthenticated(true)
        
        // Load permissions and roles
        const userPerms = await authRepository.getUserPermissions()
        const userRoles = await authRepository.getUserRoles()
        
        if (userPerms) setPermissions(userPerms)
        if (userRoles) setRoles(userRoles)
        
        return true
      } else {
        setError('Invalid credentials')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const authData = await authRepository.register(data)
      if (authData) {
        setUser(authData.user)
        setIsAuthenticated(true)
        return true
      } else {
        setError('Registration failed')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authRepository.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setPermissions([])
      setRoles([])
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const freshUser = await authRepository.getCurrentUser(true)
      if (freshUser) {
        setUser(freshUser)
        
        // Refresh permissions and roles
        const userPerms = await authRepository.getUserPermissions(true)
        const userRoles = await authRepository.getUserRoles(true)
        
        if (userPerms) setPermissions(userPerms)
        if (userRoles) setRoles(userRoles)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const updatedUser = await authRepository.updateProfile(data)
      if (updatedUser) {
        setUser(updatedUser)
        return true
      } else {
        setError('Failed to update profile')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(async (
    current: string,
    newPassword: string,
    confirm: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const success = await authRepository.changePassword(current, newPassword, confirm)
      if (!success) {
        setError('Failed to change password')
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const avatarUrl = await authRepository.uploadAvatar(file)
      if (avatarUrl && user) {
        setUser({ ...user, avatar: avatarUrl })
        return true
      } else {
        setError('Failed to upload avatar')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
    return await authRepository.checkPermission(permission)
  }, [])

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.some(p => p.slug === permission || p.name === permission)
  }, [permissions])

  const hasRole = useCallback((role: string): boolean => {
    return roles.some(r => r.slug === role || r.name === role)
  }, [roles])

  return {
    user,
    isAuthenticated,
    loading,
    error,
    permissions,
    roles,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    checkPermission,
    hasPermission,
    hasRole,
  }
}

/**
 * Hook for checking permissions
 */
export function usePermission(permission: string): boolean {
  const { permissions } = useAuth()
  return permissions.some(p => p.slug === permission || p.name === permission)
}

/**
 * Hook for checking roles
 */
export function useRole(role: string): boolean {
  const { roles } = useAuth()
  return roles.some(r => r.slug === role || r.name === role)
}

export default useAuth
