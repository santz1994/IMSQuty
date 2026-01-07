/**
 * Asset Repository
 * Data access layer for asset management with caching
 */

import { Asset, AssetMovement, assetService, AssetStats, MaintenanceLog } from '../services/AssetService'
import { PaginationParams } from '../services/BaseService'
import { CRUDRepository } from './BaseRepository'

class AssetRepository extends CRUDRepository<Asset> {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 300000, // 5 minutes
    })
  }

  /**
   * Get all assets with caching
   */
  async getAll(params?: PaginationParams): Promise<Asset[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Asset[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.getAll(params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Asset[]>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Get asset by ID with caching
   */
  async getById(id: number | string): Promise<Asset | null> {
    const cacheKey = `asset_${id}`
    const cached = this.getFromCache<Asset>(cacheKey)
    if (cached) return cached

    const response = await assetService.getById(id)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Asset>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Create new asset and invalidate cache
   */
  async create(data: Partial<Asset>): Promise<Asset | null> {
    const response = await assetService.create(data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate list caches
    this.invalidateCachePattern(/^list_/)
    return this.extractData<Asset>(response)
  }

  /**
   * Update asset and invalidate cache
   */
  async update(id: number | string, data: Partial<Asset>): Promise<Asset | null> {
    const response = await assetService.update(id, data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear specific asset and list caches
    this.clearCache(`asset_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    return this.extractData<Asset>(response)
  }

  /**
   * Delete asset and invalidate cache
   */
  async delete(id: number | string): Promise<boolean> {
    const response = await assetService.remove(id)
    if (!this.isSuccess(response)) {
      return false
    }

    // Clear all related caches
    this.clearCache(`asset_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    this.invalidateCachePattern(/^maintenance_/)
    this.invalidateCachePattern(/^movement_/)
    return true
  }

  /**
   * Get asset statistics with caching
   */
  async getStats(): Promise<AssetStats | null> {
    const cacheKey = 'stats'
    const cached = this.getFromCache<AssetStats>(cacheKey)
    if (cached) return cached

    const response = await assetService.getStats()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<AssetStats>(response)
    // Cache stats for shorter duration (2 minutes)
    this.setCache(cacheKey, data, 120000)
    return data
  }

  /**
   * Get maintenance history with caching
   */
  async getMaintenanceHistory(
    assetId: number | string,
    params?: PaginationParams
  ): Promise<MaintenanceLog[] | null> {
    const cacheKey = `maintenance_${assetId}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<MaintenanceLog[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.getMaintenanceHistory(assetId, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<MaintenanceLog[]>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Schedule maintenance and invalidate cache
   */
  async scheduleMaintenance(
    assetId: number | string,
    data: Partial<MaintenanceLog>
  ): Promise<MaintenanceLog | null> {
    const response = await assetService.scheduleMaintenance(assetId, data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate maintenance caches
    this.invalidateCachePattern(new RegExp(`^maintenance_${assetId}`))
    return this.extractData<MaintenanceLog>(response)
  }

  /**
   * Get movement history with caching
   */
  async getMovementHistory(
    assetId: number | string,
    params?: PaginationParams
  ): Promise<AssetMovement[] | null> {
    const cacheKey = `movement_${assetId}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<AssetMovement[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.getMovementHistory(assetId, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<AssetMovement[]>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Record asset movement and invalidate cache
   */
  async recordMovement(
    assetId: number | string,
    data: Partial<AssetMovement>
  ): Promise<AssetMovement | null> {
    const response = await assetService.recordMovement(assetId, data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate movement and stats caches
    this.invalidateCachePattern(new RegExp(`^movement_${assetId}`))
    this.invalidateCachePattern(/^stats/)
    this.clearCache(`asset_${assetId}`)
    return this.extractData<AssetMovement>(response)
  }

  /**
   * Search assets with caching
   */
  async search(query: string, params?: PaginationParams): Promise<Asset[] | null> {
    const cacheKey = `search_${query}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Asset[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.search(query, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Asset[]>(response)
    // Cache search results for shorter duration (2 minutes)
    this.setCache(cacheKey, data, 120000)
    return data
  }

  /**
   * Get assets by status with caching
   */
  async getByStatus(statusId: number, params?: PaginationParams): Promise<Asset[] | null> {
    const cacheKey = `status_${statusId}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Asset[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.getByStatus(statusId, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Asset[]>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Get assets by location with caching
   */
  async getByLocation(locationId: number, params?: PaginationParams): Promise<Asset[] | null> {
    const cacheKey = `location_${locationId}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Asset[]>(cacheKey)
    if (cached) return cached

    const response = await assetService.getByLocation(locationId, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Asset[]>(response)
    this.setCache(cacheKey, data)
    return data
  }

  /**
   * Assign asset to user and invalidate cache
   */
  async assignToUser(assetId: number | string, userId: number): Promise<Asset | null> {
    const response = await assetService.assignToUser(assetId, userId)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear asset cache
    this.clearCache(`asset_${assetId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    return this.extractData<Asset>(response)
  }

  /**
   * Mark asset as retired and invalidate cache
   */
  async retire(assetId: number | string, reason?: string): Promise<Asset | null> {
    const response = await assetService.retire(assetId, reason)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear all related caches
    this.clearCache(`asset_${assetId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    return this.extractData<Asset>(response)
  }

  /**
   * Force refresh asset data
   */
  async refreshAsset(id: number | string): Promise<Asset | null> {
    this.clearCache(`asset_${id}`)
    return this.getById(id)
  }

  /**
   * Force refresh asset list
   */
  async refreshList(params?: PaginationParams): Promise<Asset[] | null> {
    this.invalidateCachePattern(/^list_/)
    return this.getAll(params)
  }

  /**
   * Force refresh statistics
   */
  async refreshStats(): Promise<AssetStats | null> {
    this.clearCache('stats')
    return this.getStats()
  }
}

// Export singleton instance
export const assetRepository = new AssetRepository()
export default assetRepository
