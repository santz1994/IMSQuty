/**
 * Authentication Service
 * Business logic for authentication and authorization
 */

import { BaseService, ServiceResponse } from './BaseService'

export interface User {
  id: number
  username: string
  email: string
  name: string
  role_id: number
  division_id?: number
  location_id?: number
  phone?: string
  avatar?: string
  status: 'active' | 'inactive'
  email_verified_at?: string
  created_at?: string
  updated_at?: string
  // Relations
  role?: Role
  division?: any
  location?: any
  permissions?: Permission[]
}

export interface Role {
  id: number
  name: string
  slug: string
  description?: string
  permissions?: Permission[]
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: number
  name: string
  slug: string
  resource: string
  action: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  login: string // Can be username or email
  password: string
  remember?: boolean
}

export interface RegisterData {
  username: string
  email: string
  name: string
  password: string
  password_confirmation: string
  role_id?: number
  division_id?: number
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  expires_in: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface PasswordChange {
  current_password: string
  password: string
  password_confirmation: string
}

class AuthService extends BaseService {
  constructor() {
    super('/auth')
  }

  /**
   * Login with username or email
   */
  async login(credentials: LoginCredentials): Promise<ServiceResponse<AuthResponse>> {
    return this.post<AuthResponse>('/login', credentials)
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ServiceResponse<AuthResponse>> {
    return this.post<AuthResponse>('/register', data)
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ServiceResponse<void>> {
    return this.post<void>('/logout')
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ServiceResponse<User>> {
    return this.get<User>('/user')
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ServiceResponse<AuthResponse>> {
    return this.post<AuthResponse>('/refresh')
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: PasswordResetRequest): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/forgot-password', data)
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: PasswordReset): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/reset-password', data)
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: PasswordChange): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/change-password', data)
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/verify-email', { token })
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/resend-verification')
  }

  /**
   * Check if user has permission
   */
  async checkPermission(permission: string): Promise<ServiceResponse<{ has_permission: boolean }>> {
    return this.get<{ has_permission: boolean }>(`/check-permission/${permission}`)
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<ServiceResponse<Permission[]>> {
    return this.get<Permission[]>('/permissions')
  }

  /**
   * Get user roles
   */
  async getUserRoles(): Promise<ServiceResponse<Role[]>> {
    return this.get<Role[]>('/roles')
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<ServiceResponse<User>> {
    return this.put<User>('/profile', data)
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<ServiceResponse<{ avatar_url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)
    return this.post<{ avatar_url: string }>('/avatar', formData)
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<ServiceResponse<void>> {
    return this.delete<void>('/avatar')
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(): Promise<ServiceResponse<{ qr_code: string; secret: string }>> {
    return this.post<{ qr_code: string; secret: string }>('/2fa/enable')
  }

  /**
   * Confirm two-factor authentication
   */
  async confirm2FA(code: string): Promise<ServiceResponse<{ recovery_codes: string[] }>> {
    return this.post<{ recovery_codes: string[] }>('/2fa/confirm', { code })
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(password: string): Promise<ServiceResponse<void>> {
    return this.post<void>('/2fa/disable', { password })
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(code: string): Promise<ServiceResponse<{ valid: boolean }>> {
    return this.post<{ valid: boolean }>('/2fa/verify', { code })
  }

  /**
   * Get session history
   */
  async getSessionHistory(): Promise<ServiceResponse<any[]>> {
    return this.get<any[]>('/sessions')
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<ServiceResponse<void>> {
    return this.delete<void>(`/sessions/${sessionId}`)
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<ServiceResponse<void>> {
    return this.delete<void>('/sessions/all')
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
