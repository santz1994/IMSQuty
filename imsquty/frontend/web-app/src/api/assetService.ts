import apiClient from './client'

export interface Asset {
  id: number
  asset_tag: string
  name: string
  serial_number: string
  asset_type_id: number
  model_id: number
  manufacturer_id?: number
  division_id: number
  location_id: number
  supplier_id: number
  purchase_date: string
  warranty_months: number
  warranty_type_id: number
  warranty_expiry_date?: string
  invoice_id: string
  purchase_order_id: string
  ip_address: string
  mac_address: string
  status_id?: number
  status?: string
  assigned_to: number
  cost?: number
  notes: string
  created_at: string
  updated_at: string
}

export interface AssetListResponse {
  success: boolean
  data: Asset[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface AssetResponse {
  success: boolean
  data: Asset
  message: string
}

export const assetService = {
  getAssets: async (
    page = 1,
    perPage = 10,
    filters?: Record<string, any>,
  ): Promise<AssetListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {})
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, v.toString()]),
      ),
    })
    const response = await apiClient.get<AssetListResponse>(`/assets?${params}`)
    return response.data
  },

  getAsset: async (id: number): Promise<AssetResponse> => {
    const response = await apiClient.get<AssetResponse>(`/assets/${id}`)
    return response.data
  },

  createAsset: async (data: Partial<Asset>): Promise<AssetResponse> => {
    const response = await apiClient.post<AssetResponse>('/assets', data)
    return response.data
  },

  updateAsset: async (
    id: number,
    data: Partial<Asset>,
  ): Promise<AssetResponse> => {
    const response = await apiClient.put<AssetResponse>(`/assets/${id}`, data)
    return response.data
  },

  deleteAsset: async (id: number): Promise<AssetResponse> => {
    const response = await apiClient.delete<AssetResponse>(`/assets/${id}`)
    return response.data
  },

  searchAssets: async (query: string): Promise<AssetListResponse> => {
    const response = await apiClient.get<AssetListResponse>(
      `/assets/search?q=${query}`,
    )
    return response.data
  },
}
