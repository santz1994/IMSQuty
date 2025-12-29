import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Asset, assetService } from '../../api/assetService'

interface AssetState {
  assets: Asset[]
  currentAsset: Asset | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    perPage: number
    total: number
  }
}

const initialState: AssetState = {
  assets: [],
  currentAsset: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 10,
    total: 0,
  },
}

export const fetchAssets = createAsyncThunk(
  'asset/fetchAssets',
  async (
    { page = 1, perPage = 10, filters = {} }: any = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await assetService.getAssets(page, perPage, filters)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch assets',
      )
    }
  },
)

export const fetchAsset = createAsyncThunk(
  'asset/fetchAsset',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await assetService.getAsset(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch asset',
      )
    }
  },
)

export const createAsset = createAsyncThunk(
  'asset/createAsset',
  async (data: Partial<Asset>, { rejectWithValue }) => {
    try {
      const response = await assetService.createAsset(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create asset',
      )
    }
  },
)

export const updateAsset = createAsyncThunk(
  'asset/updateAsset',
  async ({ id, data }: { id: number; data: Partial<Asset> }, { rejectWithValue }) => {
    try {
      const response = await assetService.updateAsset(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update asset',
      )
    }
  },
)

export const deleteAsset = createAsyncThunk(
  'asset/deleteAsset',
  async (id: number, { rejectWithValue }) => {
    try {
      await assetService.deleteAsset(id)
      return id
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete asset',
      )
    }
  },
)

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    clearCurrentAsset: (state) => {
      state.currentAsset = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false
        state.assets = action.payload.data
        state.pagination = {
          page: action.payload.meta.current_page,
          perPage: action.payload.meta.per_page,
          total: action.payload.meta.total,
        }
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchAsset.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAsset.fulfilled, (state, action) => {
        state.loading = false
        state.currentAsset = action.payload
      })
      .addCase(fetchAsset.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.assets.push(action.payload)
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex((a) => a.id === action.payload.id)
        if (index !== -1) {
          state.assets[index] = action.payload
        }
        state.currentAsset = action.payload
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.assets = state.assets.filter((a) => a.id !== action.payload)
      })
  },
})

export const { clearCurrentAsset, clearError } = assetSlice.actions
export default assetSlice.reducer
