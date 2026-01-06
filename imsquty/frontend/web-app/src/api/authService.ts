
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: number
      username: string
      email: string
      first_name: string
      last_name: string
      role: string
    }
  }
  message: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

// Mock authentication - ALWAYS ENABLED for development
const USE_MOCK_AUTH = true

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    console.log('[AUTH] ✅ Mock authentication enabled - accepting any credentials')

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockResponse: LoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          username: email.split('@')[0],
          email: email,
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin',
        },
      },
      message: 'Login successful (mock mode)',
    }

    localStorage.setItem('token', mockResponse.data.token)
    localStorage.setItem('user', JSON.stringify(mockResponse.data.user))

    console.log('[AUTH] ✅ Mock login successful, token stored')
    return mockResponse
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('[AUTH] ✅ Logged out')
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },
}
