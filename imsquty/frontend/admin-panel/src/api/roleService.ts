import client from './client'

export interface Permission {
  id: number
  name: string
  display_name?: string
  description?: string
  group: string
  guard_name?: string
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
   * Get all permissions (flattened from grouped response)
   */
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await client.get<any>('/permissions')

    // Backend returns grouped permissions: { data: { group1: [perms], group2: [perms] } }
    // We need to flatten this into a single array
    if (response.data.success && response.data.data) {
      const groupedData = response.data.data
      let flatPermissions: Permission[] = []

      // Check if data is already an array (flat) or an object (grouped)
      if (Array.isArray(groupedData)) {
        flatPermissions = groupedData
      } else {
        // Flatten grouped permissions
        Object.values(groupedData).forEach((perms: any) => {
          if (Array.isArray(perms)) {
            flatPermissions = flatPermissions.concat(perms)
          }
        })
      }

      return {
        success: true,
        data: flatPermissions,
        message: response.data.message || 'Permissions fetched successfully'
      }
    }

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
   * Get permissions grouped by module (group)
   */
  async getPermissionsByModule(): Promise<ApiResponse<Record<string, Permission[]>>> {
    const response = await client.get<any>('/permissions')

    // Backend already returns grouped permissions
    if (response.data.success && response.data.data) {
      const groupedData = response.data.data

      // If already grouped, return as-is
      if (!Array.isArray(groupedData)) {
        return {
          success: response.data.success,
          data: groupedData,
          message: response.data.message || 'Permissions fetched successfully'
        }
      }

      // If it's an array, group it by 'group' field
      const groupedPermissions: Record<string, Permission[]> = {}
      groupedData.forEach((permission: Permission) => {
        const group = permission.group || 'Other'
        if (!groupedPermissions[group]) {
          groupedPermissions[group] = []
        }
        groupedPermissions[group].push(permission)
      })

      return {
        success: response.data.success,
        data: groupedPermissions,
        message: response.data.message || 'Permissions fetched successfully'
      }
    }

    return response.data
  }
}

export default new RoleService()
