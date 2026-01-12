import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import roleService, {
  CreateRoleRequest,
  Permission,
  Role,
  RoleWithPermissions,
  UpdateRoleRequest,
} from '../../api/roleService'

interface RoleState {
  roles: Role[]
  permissions: Permission[]
  permissionsByModule: Record<string, Permission[]>
  selectedRole: RoleWithPermissions | null
  loading: boolean
  error: string | null
}

const initialState: RoleState = {
  roles: [],
  permissions: [],
  permissionsByModule: {},
  selectedRole: null,
  loading: false,
  error: null,
}

// Async Thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleService.getAllRoles()
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch roles'
      )
    }
  }
)

export const fetchPermissions = createAsyncThunk(
  'roles/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleService.getAllPermissions()
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch permissions'
      )
    }
  }
)

export const fetchPermissionsByModule = createAsyncThunk(
  'roles/fetchPermissionsByModule',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleService.getPermissionsByModule()
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch permissions'
      )
    }
  }
)

export const fetchRoleById = createAsyncThunk(
  'roles/fetchRoleById',
  async (roleId: number, { rejectWithValue }) => {
    try {
      const response = await roleService.getRoleById(roleId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch role'
      )
    }
  }
)

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (data: CreateRoleRequest, { rejectWithValue }) => {
    try {
      const response = await roleService.createRole(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create role'
      )
    }
  }
)

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async (
    { id, data }: { id: number; data: UpdateRoleRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await roleService.updateRole(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update role'
      )
    }
  }
)

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: number, { rejectWithValue }) => {
    try {
      await roleService.deleteRole(roleId)
      return roleId
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete role'
      )
    }
  }
)

export const assignPermissions = createAsyncThunk(
  'roles/assignPermissions',
  async (
    { roleId, permissionIds }: { roleId: number; permissionIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      await roleService.assignPermissions(roleId, permissionIds)
      return { roleId, permissionIds }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign permissions'
      )
    }
  }
)

// Slice
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateSelectedRolePermissions: (state, action: PayloadAction<Permission[]>) => {
      if (state.selectedRole) {
        state.selectedRole.permissions = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false
        state.roles = action.payload
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Permissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchPermissions.fulfilled,
        (state, action: PayloadAction<Permission[]>) => {
          state.loading = false
          state.permissions = action.payload
        }
      )
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Permissions by Module
    builder
      .addCase(fetchPermissionsByModule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchPermissionsByModule.fulfilled,
        (state, action: PayloadAction<Record<string, Permission[]>>) => {
          state.loading = false
          state.permissionsByModule = action.payload
        }
      )
      .addCase(fetchPermissionsByModule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Role by ID
    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchRoleById.fulfilled,
        (state, action: PayloadAction<RoleWithPermissions>) => {
          state.loading = false
          state.selectedRole = action.payload
        }
      )
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create Role
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false
        state.roles.push(action.payload)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update Role
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.loading = false
        const index = state.roles.findIndex((r) => r.id === action.payload.id)
        if (index !== -1) {
          state.roles[index] = action.payload
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete Role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        state.roles = state.roles.filter((r) => r.id !== action.payload)
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Assign Permissions
    builder
      .addCase(assignPermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(assignPermissions.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(assignPermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearSelectedRole, clearError, updateSelectedRolePermissions } = roleSlice.actions
export default roleSlice.reducer
