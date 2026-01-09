import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import userService, {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../../api/userService'

interface UserState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    perPage: number
    total: number
    last_page?: number
  }
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 10,
    total: 0,
    last_page: 1,
  },
}

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (
    { page, perPage }: { page: number; perPage: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await userService.getUsers(page, perPage)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  },
)

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  },
)

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  },
)

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (
    { id, data }: { id: number; data: UpdateUserRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await userService.updateUser(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user')
    }
  },
)

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  },
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch User
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.users.findIndex((u) => u.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.currentUser = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter((u) => u.id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentUser, clearError } = userSlice.actions
export default userSlice.reducer
