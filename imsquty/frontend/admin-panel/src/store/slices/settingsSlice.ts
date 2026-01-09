import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import settingsService, {
  AllSettings,
  CacheStats,
  EmailSettings,
  QueueStats,
  StorageSettings,
  UpdateSettingsRequest
} from '../../api/settingsService'

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface SettingsState {
  settings: AllSettings | null
  queueStats: QueueStats | null
  cacheStats: CacheStats | null
  loading: boolean
  saving: boolean
  testing: boolean
  error: string | null
  successMessage: string | null
  activeCategory: 'application' | 'email' | 'storage' | 'queue' | 'cache' | 'security' | 'maintenance'
}

const initialState: SettingsState = {
  settings: null,
  queueStats: null,
  cacheStats: null,
  loading: false,
  saving: false,
  testing: false,
  error: null,
  successMessage: null,
  activeCategory: 'application',
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch all system settings
 */
export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getAllSettings()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

/**
 * Fetch settings by category
 */
export const fetchSettingsByCategory = createAsyncThunk(
  'settings/fetchByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettingsByCategory(category)
      return { category, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings')
    }
  }
)

/**
 * Update settings for a specific category
 */
export const updateSettings = createAsyncThunk(
  'settings/update',
  async (data: UpdateSettingsRequest, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettings(data)
      return { category: data.category, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings')
    }
  }
)

/**
 * Test email configuration
 */
export const testEmailSettings = createAsyncThunk(
  'settings/testEmail',
  async (emailSettings: Partial<EmailSettings>, { rejectWithValue }) => {
    try {
      const response = await settingsService.testEmailSettings(emailSettings)
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Email test failed')
    }
  }
)

/**
 * Test storage connection
 */
export const testStorageSettings = createAsyncThunk(
  'settings/testStorage',
  async (storageSettings: Partial<StorageSettings>, { rejectWithValue }) => {
    try {
      const response = await settingsService.testStorageSettings(storageSettings)
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Storage test failed')
    }
  }
)

/**
 * Fetch queue statistics
 */
export const fetchQueueStats = createAsyncThunk(
  'settings/fetchQueueStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getQueueStats()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch queue stats')
    }
  }
)

/**
 * Clear failed queue jobs
 */
export const clearFailedJobs = createAsyncThunk(
  'settings/clearFailedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.clearFailedJobs()
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear failed jobs')
    }
  }
)

/**
 * Fetch cache statistics
 */
export const fetchCacheStats = createAsyncThunk(
  'settings/fetchCacheStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getCacheStats()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cache stats')
    }
  }
)

/**
 * Clear all cache
 */
export const clearCache = createAsyncThunk(
  'settings/clearCache',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.clearCache()
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cache')
    }
  }
)

/**
 * Flush cache by pattern
 */
export const flushCacheByPattern = createAsyncThunk(
  'settings/flushCacheByPattern',
  async (pattern: string, { rejectWithValue }) => {
    try {
      const response = await settingsService.flushCacheByPattern(pattern)
      return response.data.message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to flush cache')
    }
  }
)

/**
 * Toggle maintenance mode
 */
export const toggleMaintenanceMode = createAsyncThunk(
  'settings/toggleMaintenance',
  async ({ enabled, message }: { enabled: boolean; message?: string }, { rejectWithValue }) => {
    try {
      const response = await settingsService.toggleMaintenanceMode(enabled, message)
      return { enabled, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle maintenance mode')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<SettingsState['activeCategory']>) => {
      state.activeCategory = action.payload
    },
    clearMessages: (state) => {
      state.error = null
      state.successMessage = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all settings
      .addCase(fetchAllSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSettings.fulfilled, (state, action: PayloadAction<AllSettings>) => {
        state.loading = false
        state.settings = action.payload
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch settings by category
      .addCase(fetchSettingsByCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettingsByCategory.fulfilled, (state, action) => {
        state.loading = false
        if (state.settings) {
          state.settings[action.payload.category as keyof AllSettings] = action.payload.data
        }
      })
      .addCase(fetchSettingsByCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false
        state.successMessage = 'Settings updated successfully'
        if (state.settings) {
          state.settings[action.payload.category as keyof AllSettings] = action.payload.data
        }
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })

      // Test email settings
      .addCase(testEmailSettings.pending, (state) => {
        state.testing = true
        state.error = null
        state.successMessage = null
      })
      .addCase(testEmailSettings.fulfilled, (state, action: PayloadAction<string>) => {
        state.testing = false
        state.successMessage = action.payload
      })
      .addCase(testEmailSettings.rejected, (state, action) => {
        state.testing = false
        state.error = action.payload as string
      })

      // Test storage settings
      .addCase(testStorageSettings.pending, (state) => {
        state.testing = true
        state.error = null
        state.successMessage = null
      })
      .addCase(testStorageSettings.fulfilled, (state, action: PayloadAction<string>) => {
        state.testing = false
        state.successMessage = action.payload
      })
      .addCase(testStorageSettings.rejected, (state, action) => {
        state.testing = false
        state.error = action.payload as string
      })

      // Fetch queue stats
      .addCase(fetchQueueStats.fulfilled, (state, action: PayloadAction<QueueStats>) => {
        state.queueStats = action.payload
      })
      .addCase(fetchQueueStats.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Clear failed jobs
      .addCase(clearFailedJobs.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(clearFailedJobs.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.successMessage = action.payload
      })
      .addCase(clearFailedJobs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch cache stats
      .addCase(fetchCacheStats.fulfilled, (state, action: PayloadAction<CacheStats>) => {
        state.cacheStats = action.payload
      })
      .addCase(fetchCacheStats.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // Clear cache
      .addCase(clearCache.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(clearCache.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.successMessage = action.payload
      })
      .addCase(clearCache.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Flush cache by pattern
      .addCase(flushCacheByPattern.pending, (state) => {
        state.loading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(flushCacheByPattern.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.successMessage = action.payload
      })
      .addCase(flushCacheByPattern.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Toggle maintenance mode
      .addCase(toggleMaintenanceMode.pending, (state) => {
        state.saving = true
        state.error = null
        state.successMessage = null
      })
      .addCase(toggleMaintenanceMode.fulfilled, (state, action) => {
        state.saving = false
        state.successMessage = action.payload.message
        if (state.settings) {
          state.settings.maintenance.maintenance_mode = action.payload.enabled
        }
      })
      .addCase(toggleMaintenanceMode.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  },
})

export const { setActiveCategory, clearMessages, clearError } = settingsSlice.actions

export default settingsSlice.reducer
