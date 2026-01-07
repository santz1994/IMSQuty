/**
 * Asset Service
 * Business logic for asset management
 * Extends BaseService for common CRUD operations
 */

import { CRUDService, PaginationParams, ServiceResponse } from './BaseService'

export interface Asset {
  id: number
  name: string
  asset_tag: string
  serial_number?: string
  model_id?: number
  manufacturer_id?: number
  asset_type_id?: number
  status_id?: number
  location_id?: number
  division_id?: number
  purchase_date?: string
  purchase_cost?: number
  warranty_id?: number
  notes?: string
  created_at?: string
  updated_at?: string
  // Relations
  model?: any
  manufacturer?: any
  type?: any
  status?: any
  location?: any
  division?: any
  warranty?: any
}

export interface MaintenanceLog {
  id: number
  asset_id: number
  maintenance_type: 'preventive' | 'corrective' | 'breakdown'
  description: string
  cost?: number
  performed_by?: string
  performed_at: string
  next_maintenance_date?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface AssetMovement {
  id: number
  asset_id: number
  from_location_id?: number
  to_location_id: number
  moved_by: string
  moved_at: string
  reason?: string
  notes?: string
  created_at?: string
}

export interface AssetStats {
  total: number
  available: number
  in_use: number
  maintenance: number
  retired: number
  byStatus: Array<{ name: string; value: number }>
  byLocation: Array<{ name: string; value: number }>
}

class AssetService extends CRUDService<Asset> {
  constructor() {
    super('/assets')
  }

  /**
   * Get asset statistics
   */
  async getStats(): Promise<ServiceResponse<AssetStats>> {
    return this.get<AssetStats>('/stats')
  }

  /**
   * Get maintenance history for asset
   */
  async getMaintenanceHistory(
    assetId: number | string,
    params?: PaginationParams
  ): Promise<ServiceResponse<MaintenanceLog[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<MaintenanceLog[]>(`/${assetId}/maintenance${query}`)
  }

  /**
   * Schedule maintenance for asset
   */
  async scheduleMaintenance(
    assetId: number | string,
    data: Partial<MaintenanceLog>
  ): Promise<ServiceResponse<MaintenanceLog>> {
    return this.post<MaintenanceLog>(`/${assetId}/maintenance`, data)
  }

  /**
   * Update maintenance status
   */
  async updateMaintenance(
    assetId: number | string,
    maintenanceId: number | string,
    data: Partial<MaintenanceLog>
  ): Promise<ServiceResponse<MaintenanceLog>> {
    return this.put<MaintenanceLog>(`/${assetId}/maintenance/${maintenanceId}`, data)
  }

  /**
   * Get movement history for asset
   */
  async getMovementHistory(
    assetId: number | string,
    params?: PaginationParams
  ): Promise<ServiceResponse<AssetMovement[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<AssetMovement[]>(`/${assetId}/movements${query}`)
  }

  /**
   * Record asset movement
   */
  async recordMovement(
    assetId: number | string,
    data: Partial<AssetMovement>
  ): Promise<ServiceResponse<AssetMovement>> {
    return this.post<AssetMovement>(`/${assetId}/movements`, data)
  }

  /**
   * Get warranty information
   */
  async getWarrantyInfo(assetId: number | string): Promise<ServiceResponse<any>> {
    return this.get<any>(`/${assetId}/warranty`)
  }

  /**
   * Check if warranty is valid
   */
  async checkWarranty(assetId: number | string): Promise<ServiceResponse<{ valid: boolean; expires_at?: string }>> {
    return this.get<{ valid: boolean; expires_at?: string }>(`/${assetId}/warranty/check`)
  }

  /**
   * Get assets expiring soon
   */
  async getExpiringSoon(days: number = 30): Promise<ServiceResponse<Asset[]>> {
    return this.get<Asset[]>(`/warranty/expiring?days=${days}`)
  }

  /**
   * Search assets
   */
  async search(query: string, params?: PaginationParams): Promise<ServiceResponse<Asset[]>> {
    const searchParams = { ...params, search: query }
    return this.getAll(searchParams)
  }

  /**
   * Get assets by status
   */
  async getByStatus(statusId: number, params?: PaginationParams): Promise<ServiceResponse<Asset[]>> {
    const filterParams = { ...params, filters: { status_id: statusId } }
    return this.getAll(filterParams)
  }

  /**
   * Get assets by location
   */
  async getByLocation(locationId: number, params?: PaginationParams): Promise<ServiceResponse<Asset[]>> {
    const filterParams = { ...params, filters: { location_id: locationId } }
    return this.getAll(filterParams)
  }

  /**
   * Export assets to Excel/CSV
   */
  async export(format: 'excel' | 'csv' = 'excel', filters?: any): Promise<Blob> {
    const response = await this.get<Blob>(`/export?format=${format}`, filters)
    return response.data as Blob
  }

  /**
   * Import assets from file
   */
  async import(file: File): Promise<ServiceResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    return this.post<{ imported: number; errors: string[] }>('/import', formData)
  }

  /**
   * Bulk update assets
   */
  async bulkUpdate(ids: number[], data: Partial<Asset>): Promise<ServiceResponse<{ updated: number }>> {
    return this.post<{ updated: number }>('/bulk-update', { ids, data })
  }

  /**
   * Assign asset to user
   */
  async assignToUser(assetId: number | string, userId: number): Promise<ServiceResponse<Asset>> {
    return this.post<Asset>(`/${assetId}/assign`, { user_id: userId })
  }

  /**
   * Unassign asset from user
   */
  async unassignFromUser(assetId: number | string): Promise<ServiceResponse<Asset>> {
    return this.post<Asset>(`/${assetId}/unassign`)
  }

  /**
   * Mark asset as retired
   */
  async retire(assetId: number | string, reason?: string): Promise<ServiceResponse<Asset>> {
    return this.post<Asset>(`/${assetId}/retire`, { reason })
  }
}

// Export singleton instance
export const assetService = new AssetService()
export default assetService
