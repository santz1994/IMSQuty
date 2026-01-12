import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authService, User } from '../../api/authService'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  loading: false,
  error: null,
  isAuthenticated: authService.isAuthenticated(),
}

/**
 * Login thunk - Authenticates user with backend API
 * Uses authService which handles token storage and user data
 */
export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.login(email, password)

      if (!response.success) {
        return rejectWithValue(response.message || 'Login failed')
      }

      // authService already stores tokens and user in localStorage
      // We just need to return the data for Redux state
      return {
        user: response.data.user,
        token: response.data.access_token,
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      return rejectWithValue(errorMessage)
    }
  },
)

/**
 * Logout thunk - Clears user session
 * Calls backend to invalidate token and clears localStorage
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

/**
 * Fetch current user thunk - Refresh user data from API
 * Useful after profile updates or to verify session
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.fetchCurrentUser()
      return user
    } catch (error: any) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Restore auth state from localStorage on app init
     * Called when app loads to check if user was logged in
     */
    restoreAuth: (state) => {
      state.user = authService.getCurrentUser()
      state.token = authService.getToken()
      state.isAuthenticated = authService.isAuthenticated()
    },
    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })

      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { restoreAuth, clearError } = authSlice.actions
export default authSlice.reducer
