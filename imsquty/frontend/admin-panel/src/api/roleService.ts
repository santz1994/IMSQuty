import client from './client'

export interface Permission {
  id: number
  name: string
  display_name: string
  description?: string
  module: string
  created_at?: string
  updated_at?: string
}

export interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  permissions?: Permission[]
  users_count?: number
  created_at?: string
  updated_at?: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

export interface CreateRoleRequest {
  name: string
  display_name: string
  description?: string
  permission_ids: number[]
}

export interface UpdateRoleRequest {
  name?: string
  display_name?: string
  description?: string
  permission_ids?: number[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

class RoleService {
  /**
   * Get all roles
   */
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    const response = await client.get<ApiResponse<Role[]>>('/roles')
    return response.data
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleById(id: number): Promise<ApiResponse<RoleWithPermissions>> {
    const response = await client.get<ApiResponse<RoleWithPermissions>>(
      `/roles/${id}`
    )
    return response.data
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    const response = await client.post<ApiResponse<Role>>('/roles', data)
    return response.data
  }

  /**
   * Update existing role
   */
  async updateRole(
    id: number,
    data: UpdateRoleRequest
  ): Promise<ApiResponse<Role>> {
    const response = await client.put<ApiResponse<Role>>(
      `/roles/${id}`,
      data
    )
    return response.data
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(`/roles/${id}`)
    return response.data
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await client.get<ApiResponse<Permission[]>>(
      '/permissions'
    )
    return response.data
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<ApiResponse<null>> {
    const response = await client.post<ApiResponse<null>>(
      `/roles/${roleId}/permissions`,
      { permission_ids: permissionIds }
    )
    return response.data
  }

  /**
   * Remove permission from role
   */
  async removePermission(
    roleId: number,
    permissionId: number
  ): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(
      `/roles/${roleId}/permissions/${permissionId}`
    )
    return response.data
  }

  /**
   * Get permissions grouped by module
   */
  async getPermissionsByModule(): Promise<ApiResponse<Record<string, Permission[]>>> {
    const response = await client.get<ApiResponse<Permission[]>>(
      '/permissions'
    )

    // Group permissions by module
    const groupedPermissions: Record<string, Permission[]> = {}
    response.data.data.forEach((permission) => {
      if (!groupedPermissions[permission.module]) {
        groupedPermissions[permission.module] = []
      }
      groupedPermissions[permission.module].push(permission)
    })

    return {
      success: response.data.success,
      data: groupedPermissions,
      message: response.data.message,
    }
  }
}

export default new RoleService()
