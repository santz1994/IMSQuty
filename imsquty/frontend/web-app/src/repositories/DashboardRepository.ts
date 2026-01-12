/**
 * Dashboard Repository
 * Data access layer for dashboard data with short-lived caching
 */

import dashboardService, {
  Activity,
  AssetStatusDistribution,
  DashboardStats,
  MaintenanceSchedule,
  RoleBasedDashboard,
  TicketPriorityDistribution,
  TrendData,
  WarrantyExpiring,
} from '../services/DashboardService'
import { BaseRepository } from './BaseRepository'

class DashboardRepository extends BaseRepository<DashboardStats> {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 120000, // 2 minutes - shorter cache for real-time data
    })
  }

  /**
   * Get overall dashboard statistics
   */
  async getStats(forceRefresh: boolean = false): Promise<DashboardStats | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<DashboardStats>('stats')
      if (cached) return cached
    }

    const response = await dashboardService.getStats()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<DashboardStats>(response)
    if (data) {
      this.setCache('stats', data)
    }
    return data
  }

  /**
   * Get role-based dashboard
   */
  async getRoleDashboard(roleId?: number, forceRefresh: boolean = false): Promise<RoleBasedDashboard | null> {
    const cacheKey = `role_dashboard_${roleId || 'current'}`

    if (!forceRefresh) {
      const cached = this.getFromCache<RoleBasedDashboard>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getRoleDashboard(roleId)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<RoleBasedDashboard>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get asset status distribution
   */
  async getAssetStatusDistribution(forceRefresh: boolean = false): Promise<AssetStatusDistribution[] | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<AssetStatusDistribution[]>('asset_distribution')
      if (cached) return cached
    }

    const response = await dashboardService.getAssetStatusDistribution()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<AssetStatusDistribution[]>(response)
    if (data) {
      this.setCache('asset_distribution', data)
    }
    return data
  }

  /**
   * Get ticket priority distribution
   */
  async getTicketPriorityDistribution(forceRefresh: boolean = false): Promise<TicketPriorityDistribution[] | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<TicketPriorityDistribution[]>('ticket_distribution')
      if (cached) return cached
    }

    const response = await dashboardService.getTicketPriorityDistribution()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TicketPriorityDistribution[]>(response)
    if (data) {
      this.setCache('ticket_distribution', data)
    }
    return data
  }

  /**
   * Get asset trends
   */
  async getAssetTrends(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    forceRefresh: boolean = false
  ): Promise<TrendData[] | null> {
    const cacheKey = `asset_trends_${period}`

    if (!forceRefresh) {
      const cached = this.getFromCache<TrendData[]>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getAssetTrends(period)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TrendData[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get ticket trends
   */
  async getTicketTrends(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    forceRefresh: boolean = false
  ): Promise<TrendData[] | null> {
    const cacheKey = `ticket_trends_${period}`

    if (!forceRefresh) {
      const cached = this.getFromCache<TrendData[]>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getTicketTrends(period)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TrendData[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get maintenance schedule
   */
  async getMaintenanceSchedule(days: number = 30, forceRefresh: boolean = false): Promise<MaintenanceSchedule[] | null> {
    const cacheKey = `maintenance_schedule_${days}`

    if (!forceRefresh) {
      const cached = this.getFromCache<MaintenanceSchedule[]>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getMaintenanceSchedule(days)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<MaintenanceSchedule[]>(response)
    if (data) {
      // Cache for shorter time (1 minute) since schedules change
      this.setCache(cacheKey, data, 60000)
    }
    return data
  }

  /**
   * Get warranties expiring soon
   */
  async getWarrantiesExpiring(days: number = 90, forceRefresh: boolean = false): Promise<WarrantyExpiring[] | null> {
    const cacheKey = `warranties_expiring_${days}`

    if (!forceRefresh) {
      const cached = this.getFromCache<WarrantyExpiring[]>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getWarrantiesExpiring(days)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<WarrantyExpiring[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10, forceRefresh: boolean = false): Promise<Activity[] | null> {
    const cacheKey = `recent_activities_${limit}`

    if (!forceRefresh) {
      const cached = this.getFromCache<Activity[]>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getRecentActivities(limit)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Activity[]>(response)
    if (data) {
      // Very short cache (30 seconds) for activities
      this.setCache(cacheKey, data, 30000)
    }
    return data
  }

  /**
   * Get user-specific dashboard
   */
  async getUserDashboard(forceRefresh: boolean = false): Promise<DashboardStats | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<DashboardStats>('user_dashboard')
      if (cached) return cached
    }

    const response = await dashboardService.getUserDashboard()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<DashboardStats>(response)
    if (data) {
      this.setCache('user_dashboard', data)
    }
    return data
  }

  /**
   * Get division dashboard
   */
  async getDivisionDashboard(divisionId: number, forceRefresh: boolean = false): Promise<DashboardStats | null> {
    const cacheKey = `division_dashboard_${divisionId}`

    if (!forceRefresh) {
      const cached = this.getFromCache<DashboardStats>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getDivisionDashboard(divisionId)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<DashboardStats>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get location dashboard
   */
  async getLocationDashboard(locationId: number, forceRefresh: boolean = false): Promise<DashboardStats | null> {
    const cacheKey = `location_dashboard_${locationId}`

    if (!forceRefresh) {
      const cached = this.getFromCache<DashboardStats>(cacheKey)
      if (cached) return cached
    }

    const response = await dashboardService.getLocationDashboard(locationId)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<DashboardStats>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get system performance metrics
   */
  async getSystemMetrics(forceRefresh: boolean = false): Promise<any> {
    if (!forceRefresh) {
      const cached = this.getFromCache<any>('system_metrics')
      if (cached) return cached
    }

    // const response = await dashboardService.getSystemHealth()
    const response = { success: true, data: { cpu: 0, memory: 0, disk: 0, network: 0 }, message: 'Mock data' }
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<any>(response)
    if (data) {
      // Short cache for real-time metrics (30 seconds)
      this.setCache('system_metrics', data, 30000)
    }
    return data
  }

  /**
   * Get dashboard configuration
   */
  async getDashboardConfig(forceRefresh: boolean = false): Promise<any> {
    if (!forceRefresh) {
      const cached = this.getFromCache<any>('dashboard_config')
      if (cached) return cached
    }

    const response = await dashboardService.getDashboardConfig()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<any>(response)
    if (data) {
      // Long cache for config (10 minutes)
      this.setCache('dashboard_config', data, 600000)
    }
    return data
  }

  /**
   * Save dashboard configuration
   */
  async saveDashboardConfig(config: any): Promise<boolean> {
    const response = await dashboardService.saveDashboardConfig(config)
    if (this.isSuccess(response)) {
      // Update cache
      this.setCache('dashboard_config', config, 600000)
      return true
    }
    return false
  }

  /**
   * Force refresh all dashboard data
   */
  async refreshAll(): Promise<void> {
    this.clearAllCache()
  }

  /**
   * Refresh specific dashboard type
   */
  refreshDashboardType(type: 'stats' | 'role' | 'user' | 'division' | 'location'): void {
    this.invalidateCachePattern(new RegExp(`^${type}_`))
  }
}

// Export singleton instance
export const dashboardRepository = new DashboardRepository()
export default dashboardRepository
