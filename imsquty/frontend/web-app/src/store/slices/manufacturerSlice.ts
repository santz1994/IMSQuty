import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Manufacturer, manufacturerService } from '../../api/manufacturerService'

interface ManufacturerState {
  manufacturers: Manufacturer[]
  currentManufacturer: Manufacturer | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    perPage: number
    total: number
  }
}

const initialState: ManufacturerState = {
  manufacturers: [],
  currentManufacturer: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 50,
    total: 0,
  },
}

export const fetchManufacturers = createAsyncThunk(
  'manufacturer/fetchManufacturers',
  async (
    { page = 1, perPage = 50, filters = {} }: any = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await manufacturerService.getManufacturers(
        page,
        perPage,
        filters,
      )
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch manufacturers',
      )
    }
  },
)

export const fetchActiveManufacturers = createAsyncThunk(
  'manufacturer/fetchActiveManufacturers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await manufacturerService.getActiveManufacturers()
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active manufacturers',
      )
    }
  },
)

const manufacturerSlice = createSlice({
  name: 'manufacturer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all manufacturers
    builder
      .addCase(fetchManufacturers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchManufacturers.fulfilled, (state, action: any) => {
        state.loading = false
        state.manufacturers = action.payload.data || []
        if (action.payload.meta) {
          state.pagination = {
            page: action.payload.meta.current_page,
            perPage: action.payload.meta.per_page,
            total: action.payload.meta.total,
          }
        }
      })
      .addCase(fetchManufacturers.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch active manufacturers
    builder
      .addCase(fetchActiveManufacturers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActiveManufacturers.fulfilled, (state, action: any) => {
        state.loading = false
        state.manufacturers = action.payload.data || []
      })
      .addCase(fetchActiveManufacturers.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default manufacturerSlice.reducer
