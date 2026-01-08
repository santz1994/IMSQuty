/**
 * Auth Repository
 * Data access layer for authentication with session caching
 */

import authService, {
  AuthResponse,
  LoginCredentials,
  Permission,
  RegisterData,
  Role,
  User
} from '../services/AuthService'
import { BaseRepository } from './BaseRepository'

class AuthRepository extends BaseRepository<User> {
  private static instance: AuthRepository
  private currentUser: User | null = null

  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 600000, // 10 minutes for auth data
    })
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository()
    }
    return AuthRepository.instance
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    const response = await authService.login(credentials)
    if (!this.isSuccess(response)) {
      return null
    }

    const authData = this.extractData<AuthResponse>(response)
    if (authData) {
      // Cache user data
      this.currentUser = authData.user
      this.setCache('current_user', authData.user)
      this.setCache('auth_token', authData.token)

      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.user))
      }
    }
    return authData
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse | null> {
    const response = await authService.register(data)
    if (!this.isSuccess(response)) {
      return null
    }

    const authData = this.extractData<AuthResponse>(response)
    if (authData) {
      this.currentUser = authData.user
      this.setCache('current_user', authData.user)
      this.setCache('auth_token', authData.token)

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.user))
      }
    }
    return authData
  }

  /**
   * Logout current user
   */
  async logout(): Promise<boolean> {
    const response = await authService.logout()

    // Clear all cached data regardless of response
    this.clearAllCache()
    this.currentUser = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }

    return this.isSuccess(response)
  }

  /**
   * Get current authenticated user (with caching)
   */
  async getCurrentUser(forceRefresh: boolean = false): Promise<User | null> {
    if (!forceRefresh && this.currentUser) {
      return this.currentUser
    }

    const cached = this.getFromCache<User>('current_user')
    if (!forceRefresh && cached) {
      this.currentUser = cached
      return cached
    }

    const response = await authService.getCurrentUser()
    if (!this.isSuccess(response)) {
      return null
    }

    const user = this.extractData<User>(response)
    if (user) {
      this.currentUser = user
      this.setCache('current_user', user)

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
    return user
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse | null> {
    const response = await authService.refreshToken()
    if (!this.isSuccess(response)) {
      return null
    }

    const authData = this.extractData<AuthResponse>(response)
    if (authData) {
      this.setCache('auth_token', authData.token)

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.token)
      }
    }
    return authData
  }

  /**
   * Get user permissions (with caching)
   */
  async getUserPermissions(forceRefresh: boolean = false): Promise<Permission[] | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<Permission[]>('user_permissions')
      if (cached) return cached
    }

    const response = await authService.getUserPermissions()
    if (!this.isSuccess(response)) {
      return null
    }

    const permissions = this.extractData<Permission[]>(response)
    if (permissions) {
      this.setCache('user_permissions', permissions)
    }
    return permissions
  }

  /**
   * Get user roles (with caching)
   */
  async getUserRoles(forceRefresh: boolean = false): Promise<Role[] | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<Role[]>('user_roles')
      if (cached) return cached
    }

    const response = await authService.getUserRoles()
    if (!this.isSuccess(response)) {
      return null
    }

    const roles = this.extractData<Role[]>(response)
    if (roles) {
      this.setCache('user_roles', roles)
    }
    return roles
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(permission: string): Promise<boolean> {
    const response = await authService.checkPermission(permission)
    if (!this.isSuccess(response)) {
      return false
    }

    const result = this.extractData<{ has_permission: boolean }>(response)
    return result?.has_permission || false
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User | null> {
    const response = await authService.updateProfile(data)
    if (!this.isSuccess(response)) {
      return null
    }

    const user = this.extractData<User>(response)
    if (user) {
      this.currentUser = user
      this.setCache('current_user', user)

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
    return user
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> {
    const response = await authService.changePassword({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
    return this.isSuccess(response)
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string | null> {
    const response = await authService.uploadAvatar(file)
    if (!this.isSuccess(response)) {
      return null
    }

    const result = this.extractData<{ avatar_url: string }>(response)
    if (result?.avatar_url) {
      // Update cached user with new avatar
      if (this.currentUser) {
        this.currentUser.avatar = result.avatar_url
        this.setCache('current_user', this.currentUser)

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.currentUser))
        }
      }
    }
    return result?.avatar_url || null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    const token = localStorage.getItem('auth_token')
    return !!token
  }

  /**
   * Get stored auth token
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  /**
   * Get cached user from localStorage
   */
  getCachedUser(): User | null {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    this.clearAllCache()
    this.currentUser = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }
}

// Export singleton instance
export const authRepository = AuthRepository.getInstance()
export default authRepository
