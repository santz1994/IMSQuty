/**
 * Dashboard Service  
 * Business logic for dashboard metrics and analytics
 */

import { BaseService, ServiceResponse } from './BaseService'

export interface DashboardStats {
  assets: {
    total: number
    available: number
    in_use: number
    maintenance: number
    retired: number
  }
  tickets: {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
  }
  users: {
    total: number
    active: number
    inactive: number
    online: number
  }
  financial: {
    total_assets_value: number
    maintenance_cost: number
    purchase_cost_ytd: number
    depreciation: number
  }
  recent_activities: Activity[]
  asset_trends: TrendData[]
  ticket_trends: TrendData[]
}

export interface Activity {
  id: number
  type: 'asset' | 'ticket' | 'maintenance' | 'movement' | 'purchase'
  title: string
  description: string
  user: string
  timestamp: string
  icon?: string
  color?: string
}

export interface TrendData {
  date: string
  value: number
  label?: string
}

export interface AssetStatusDistribution {
  status: string
  count: number
  percentage: number
  color?: string
}

export interface TicketPriorityDistribution {
  priority: string
  count: number
  percentage: number
  color?: string
}

export interface MaintenanceSchedule {
  id: number
  asset_id: number
  asset_name: string
  maintenance_type: string
  scheduled_date: string
  status: string
}

export interface WarrantyExpiring {
  id: number
  asset_id: number
  asset_name: string
  warranty_end: string
  days_remaining: number
}

export interface RoleBasedDashboard {
  role: string
  widgets: DashboardWidget[]
  quick_actions: QuickAction[]
  metrics: DashboardMetric[]
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'table' | 'stat' | 'list'
  title: string
  data: any
  config?: any
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  permission?: string
}

export interface DashboardMetric {
  id: string
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage'
}

class DashboardService extends BaseService {
  constructor() {
    super('/dashboard')
  }

  /**
   * Get overall dashboard statistics
   */
  async getStats(): Promise<ServiceResponse<DashboardStats>> {
    return this.get<DashboardStats>('/stats')
  }

  /**
   * Get role-based dashboard configuration
   */
  async getRoleDashboard(roleId?: number): Promise<ServiceResponse<RoleBasedDashboard>> {
    const endpoint = roleId ? `/role/${roleId}` : '/role'
    return this.get<RoleBasedDashboard>(endpoint)
  }

  /**
   * Get asset status distribution
   */
  async getAssetStatusDistribution(): Promise<ServiceResponse<AssetStatusDistribution[]>> {
    return this.get<AssetStatusDistribution[]>('/assets/distribution')
  }

  /**
   * Get ticket priority distribution
   */
  async getTicketPriorityDistribution(): Promise<ServiceResponse<TicketPriorityDistribution[]>> {
    return this.get<TicketPriorityDistribution[]>('/tickets/distribution')
  }

  /**
   * Get asset trends
   */
  async getAssetTrends(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ServiceResponse<TrendData[]>> {
    return this.get<TrendData[]>(`/assets/trends?period=${period}`)
  }

  /**
   * Get ticket trends
   */
  async getTicketTrends(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ServiceResponse<TrendData[]>> {
    return this.get<TrendData[]>(`/tickets/trends?period=${period}`)
  }

  /**
   * Get maintenance schedule
   */
  async getMaintenanceSchedule(days: number = 30): Promise<ServiceResponse<MaintenanceSchedule[]>> {
    return this.get<MaintenanceSchedule[]>(`/maintenance/schedule?days=${days}`)
  }

  /**
   * Get warranties expiring soon
   */
  async getWarrantiesExpiring(days: number = 90): Promise<ServiceResponse<WarrantyExpiring[]>> {
    return this.get<WarrantyExpiring[]>(`/warranties/expiring?days=${days}`)
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<ServiceResponse<Activity[]>> {
    return this.get<Activity[]>(`/activities?limit=${limit}`)
  }

  /**
   * Get user-specific dashboard
   */
  async getUserDashboard(): Promise<ServiceResponse<DashboardStats>> {
    return this.get<DashboardStats>('/user')
  }

  /**
   * Get division dashboard
   */
  async getDivisionDashboard(divisionId: number): Promise<ServiceResponse<DashboardStats>> {
    return this.get<DashboardStats>(`/division/${divisionId}`)
  }

  /**
   * Get location dashboard
   */
  async getLocationDashboard(locationId: number): Promise<ServiceResponse<DashboardStats>> {
    return this.get<DashboardStats>(`/location/${locationId}`)
  }

  /**
   * Export dashboard data
   */
  async exportData(format: 'excel' | 'pdf' | 'csv' = 'excel'): Promise<Blob> {
    const response = await this.get<Blob>(`/export?format=${format}`)
    return response.data as Blob
  }

  /**
   * Save dashboard configuration
   */
  async saveDashboardConfig(config: any): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/config', config)
  }

  /**
   * Get dashboard configuration
   */
  async getDashboardConfig(): Promise<ServiceResponse<any>> {
    return this.get<any>('/config')
  }

  /**
   * Reset dashboard to default
   */
  async resetDashboard(): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/reset')
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()
export default dashboardService
