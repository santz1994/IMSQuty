import apiClient from './client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LoginRequest {
  username: string
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

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions: Permission[]
}

export interface Permission {
  id: number
  name: string
  guard_name: string
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string  // Single role string for frontend (transformed from roles array)
  roles?: Role[]  // Original roles array from backend
  permissions: string[]  // Flattened permissions for easy checking
  department?: string
  position?: string
  avatar?: string
  is_active: boolean
  status?: string
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

// Token storage keys
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform backend user data to frontend format
 * Extracts primary role from roles array and flattens permissions
 */
function transformUserData(userData: any): User {
  // Get primary role name (first role in array)
  const primaryRole = userData.roles && userData.roles.length > 0
    ? userData.roles[0].name
    : 'user'

  // Flatten all permissions from all roles
  const allPermissions: string[] = []
  if (userData.roles && Array.isArray(userData.roles)) {
    userData.roles.forEach((role: Role) => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((perm: Permission) => {
          if (!allPermissions.includes(perm.name)) {
            allPermissions.push(perm.name)
          }
        })
      }
    })
  }

  // Construct full name
  const fullName = userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim()

  return {
    id: userData.id?.toString() || '',
    username: userData.username || '',
    email: userData.email || '',
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    full_name: fullName,
    role: primaryRole,  // Single role string for easy checking
    roles: userData.roles,  // Keep original roles array
    permissions: allPermissions,  // Flattened permissions
    department: userData.department_id || userData.department,
    position: userData.position,
    avatar: userData.avatar,
    is_active: userData.status === 'active',
    status: userData.status,
    email_verified_at: userData.email_verified_at,
    mfa_enabled: userData.mfa_enabled || false,
    last_login_at: userData.last_login_at,
  }
}

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export const authService = {
  /**
   * Login with username/email and password - REAL DATABASE ONLY
   * Automatically detects if input is email or username and sends appropriate field
   */
  login: async (usernameOrEmail: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('[AUTH] 🔑 Attempting real database login...')

      // Detect if input is email or username
      const isEmail = usernameOrEmail.includes('@')
      const requestBody = isEmail
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password }

      const response = await apiClient.post<LoginResponse>(
        `${AUTH_API_BASE}/login`,
        requestBody
      )

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data.data

        // Transform user data: Extract primary role and flatten permissions
        const transformedUser = transformUserData(user)

        // Store tokens and transformed user data
        localStorage.setItem(TOKEN_KEY, access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
        localStorage.setItem(USER_KEY, JSON.stringify(transformedUser))

        console.log('[AUTH] ✅ Login successful')
        console.log('[AUTH] 👤 User:', transformedUser.full_name, '|', transformedUser.role)
        console.log('[AUTH] 🔐 Permissions:', transformedUser.permissions.length)

        // Update response with transformed user
        response.data.data.user = transformedUser
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
   * Logout current user - REAL API ONLY
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_API_BASE}/logout`)
      console.log('[AUTH] 🌐 Server logout successful')
    } catch (error) {
      console.warn('[AUTH] ⚠ Logout API call failed, clearing local storage anyway')
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
}

export default authService
