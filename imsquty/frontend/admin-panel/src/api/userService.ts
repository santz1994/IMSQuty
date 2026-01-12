import client from './client'

export interface User {
  id: number
  email: string
  username?: string
  first_name: string
  last_name: string
  role_id: number
  role_name?: string
  department?: string
  team?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserListResponse {
  success: boolean
  data: User[]
  message: string
  meta?: {
    pagination?: {
      page: number
      per_page: number
      total: number
      last_page: number
    }
  }
}

export interface UserDetailResponse {
  success: boolean
  data: User
  message: string
}

export interface CreateUserRequest {
  email: string
  first_name: string
  last_name: string
  password: string
  role_id: number
}

export interface UpdateUserRequest {
  email?: string
  first_name?: string
  last_name?: string
  role_id?: number
  is_active?: boolean
}

class UserService {
  async getUsers(
    page: number = 1,
    perPage: number = 10,
  ): Promise<UserListResponse> {
    const response = await client.get<UserListResponse>(
      `/users?page=${page}&per_page=${perPage}`,
    )
    return response.data
  }

  async getUser(id: number): Promise<UserDetailResponse> {
    const response = await client.get<UserDetailResponse>(`/users/${id}`)
    return response.data
  }

  async createUser(data: CreateUserRequest): Promise<UserDetailResponse> {
    const response = await client.post<UserDetailResponse>('/users', data)
    return response.data
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest,
  ): Promise<UserDetailResponse> {
    const response = await client.put<UserDetailResponse>(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const response = await client.delete(`/users/${id}`)
    return response.data
  }
}

export default new UserService()
