import apiClient from './client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    user: User
  }
  message: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    access_token: string
    token_type: string
    expires_in: number
  }
  message: string
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  permissions: string[]
  department?: string
  position?: string
  avatar?: string
  is_active: boolean
  email_verified_at?: string
  mfa_enabled: boolean
  last_login_at?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface MFASetupResponse {
  success: boolean
  data: {
    qr_code: string
    secret: string
    backup_codes: string[]
  }
}

export interface MFAVerifyRequest {
  code: string
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTH_API_BASE = '/auth'
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// Token storage keys
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (USE_MOCK_AUTH) {
      console.log('[AUTH] 🔧 Mock mode enabled - bypassing real API')
      return authService.mockLogin(email, password)
    }

    try {
      console.log('[AUTH] 🔑 Attempting login...')

      const response = await apiClient.post<LoginResponse>(
        `${AUTH_API_BASE}/login`,
        { email, password }
      )

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data.data

        // Store tokens and user data
        localStorage.setItem(TOKEN_KEY, access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        console.log('[AUTH] ✅ Login successful')
        console.log('[AUTH] 👤 User:', user.full_name, '|', user.role)
      }

      return response.data
    } catch (error: any) {
      console.error('[AUTH] ❌ Login failed:', error.response?.data?.message || error.message)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
      console.log('[AUTH] 📝 Attempting registration...')

      const response = await apiClient.post<LoginResponse>(
        `${AUTH_API_BASE}/register`,
        data
      )

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data.data

        localStorage.setItem(TOKEN_KEY, access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        console.log('[AUTH] ✅ Registration successful')
      }

      return response.data
    } catch (error: any) {
      console.error('[AUTH] ❌ Registration failed:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    if (!USE_MOCK_AUTH) {
      try {
        await apiClient.post(`${AUTH_API_BASE}/logout`)
      } catch (error) {
        console.warn('[AUTH] ⚠ Logout API call failed, clearing local storage anyway')
      }
    }

    // Clear all auth data
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    console.log('[AUTH] 👋 Logged out successfully')
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        `${AUTH_API_BASE}/refresh`,
        { refresh_token: refreshToken }
      )

      if (response.data.success) {
        const { access_token } = response.data.data
        localStorage.setItem(TOKEN_KEY, access_token)
        console.log('[AUTH] 🔄 Token refreshed successfully')
        return access_token
      }

      throw new Error('Token refresh failed')
    } catch (error: any) {
      console.error('[AUTH] ❌ Token refresh failed')
      authService.logout()
      throw error
    }
  },

  /**
   * Get current user profile from API
   */
  fetchCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        `${AUTH_API_BASE}/me`
      )

      if (response.data.success) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.data))
        return response.data.data
      }

      throw new Error('Failed to fetch user profile')
    } catch (error) {
      console.error('[AUTH] ❌ Failed to fetch current user')
      throw error
    }
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get access token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: (permission: string): boolean => {
    const user = authService.getCurrentUser()
    return user?.permissions?.includes(permission) || false
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser()
    return user?.role === role
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/change-password`, data)
      console.log('[AUTH] ✅ Password changed successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ Password change failed')
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/forgot-password`, data)
      console.log('[AUTH] ✅ Password reset email sent')
    } catch (error: any) {
      console.error('[AUTH] ❌ Password reset request failed')
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/reset-password`, data)
      console.log('[AUTH] ✅ Password reset successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ Password reset failed')
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  },

  /**
   * Setup MFA (Multi-Factor Authentication)
   */
  setupMFA: async (): Promise<MFASetupResponse> => {
    try {
      const response = await apiClient.post<MFASetupResponse>(
        `${AUTH_API_BASE}/mfa/setup`
      )
      console.log('[AUTH] ✅ MFA setup initiated')
      return response.data
    } catch (error: any) {
      console.error('[AUTH] ❌ MFA setup failed')
      throw new Error(error.response?.data?.message || 'MFA setup failed')
    }
  },

  /**
   * Verify MFA code
   */
  verifyMFA: async (data: MFAVerifyRequest): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/mfa/verify`, data)
      console.log('[AUTH] ✅ MFA verified successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ MFA verification failed')
      throw new Error(error.response?.data?.message || 'MFA verification failed')
    }
  },

  /**
   * Disable MFA
   */
  disableMFA: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/mfa/disable`)
      console.log('[AUTH] ✅ MFA disabled successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ MFA disable failed')
      throw new Error(error.response?.data?.message || 'MFA disable failed')
    }
  },

  /**
   * Get user sessions
   */
  getSessions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(
        `${AUTH_API_BASE}/sessions`
      )
      return response.data.data
    } catch (error: any) {
      console.error('[AUTH] ❌ Failed to fetch sessions')
      throw error
    }
  },

  /**
   * Revoke specific session
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    try {
      await apiClient.delete(`${AUTH_API_BASE}/sessions/${sessionId}`)
      console.log('[AUTH] ✅ Session revoked successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ Session revocation failed')
      throw error
    }
  },

  /**
   * Revoke all other sessions (keep current)
   */
  revokeOtherSessions: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/sessions/revoke-others`)
      console.log('[AUTH] ✅ Other sessions revoked successfully')
    } catch (error: any) {
      console.error('[AUTH] ❌ Failed to revoke other sessions')
      throw error
    }
  },

  /**
   * Get login history
   */
  getLoginHistory: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(
        `${AUTH_API_BASE}/login-history`,
        { params: { limit } }
      )
      return response.data.data
    } catch (error: any) {
      console.error('[AUTH] ❌ Failed to fetch login history')
      throw error
    }
  },

  // ============================================================================
  // MOCK AUTHENTICATION (for development without backend)
  // ============================================================================

  /**
   * Mock login for development
   */
  mockLogin: async (email: string, password: string): Promise<LoginResponse> => {
    console.log('[AUTH] 🔧 Mock authentication - accepting any credentials')

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockUser: User = {
      id: '1',
      username: email.split('@')[0],
      email: email,
      first_name: 'Demo',
      last_name: 'User',
      full_name: 'Demo User',
      role: 'admin',
      permissions: ['all'],
      department: 'IT',
      position: 'Senior Developer',
      is_active: true,
      mfa_enabled: false,
      email_verified_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    }

    const mockResponse: LoginResponse = {
      success: true,
      data: {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 3600,
        user: mockUser,
      },
      message: 'Login successful (mock mode)',
    }

    localStorage.setItem(TOKEN_KEY, mockResponse.data.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, mockResponse.data.refresh_token)
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser))

    console.log('[AUTH] ✅ Mock login successful')
    console.log('[AUTH] 👤 User:', mockUser.full_name, '|', mockUser.role)

    return mockResponse
  },
}

export default authService
