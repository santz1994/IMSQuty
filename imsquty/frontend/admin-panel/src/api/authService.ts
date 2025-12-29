import client from './client'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role_id?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: User
  }
  message: string
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await client.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token)
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
