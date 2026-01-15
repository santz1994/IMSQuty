import client from './client'

export interface Role {
  id: number
  name: string
  display_name: string
  level: number
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  username?: string
  role?: string  // Single role string (primary role)
  role_id?: number
  roles?: Role[]  // Array of roles
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    refresh_token: string
    user: User
  }
  message: string
}

class AuthService {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    // Detect if input is email or username
    const isEmail = usernameOrEmail.includes('@')
    const requestBody = isEmail
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password }

    const response = await client.post<LoginResponse>('/auth/login', requestBody)
    if (response.data.data.access_token) {
      localStorage.setItem('token', response.data.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    return response.data
  }

  async logout(): Promise<void> {
    await client.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }
}

export default new AuthService()
