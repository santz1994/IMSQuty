import apiClient from './client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface KPIMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  change: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  category: 'asset' | 'ticket' | 'financial' | 'user' | 'operational'
  trend?: 'up' | 'down' | 'stable'
  description?: string
}

export interface SystemKPIs {
  // Asset KPIs
  asset_availability: number
  asset_utilization: number
  maintenance_completion_rate: number
  asset_depreciation_rate: number

  // Ticket KPIs
  ticket_resolution_rate: number
  ticket_avg_response_time: number
  ticket_sla_compliance: number
  ticket_first_contact_resolution: number
  ticket_customer_satisfaction: number

  // Financial KPIs
  total_asset_value: number
  maintenance_cost_ratio: number
  cost_per_ticket: number
  budget_utilization: number
  roi: number

  // User KPIs
  user_satisfaction_score: number
  system_uptime: number
  active_users_ratio: number

  // Operational KPIs
  inventory_turnover: number
  booking_utilization: number
  process_efficiency: number
}

export interface KPIResponse {
  success: boolean
  data: SystemKPIs
  message: string
}

export interface MetricsResponse {
  success: boolean
  data: {
    metrics: KPIMetric[]
    summary: {
      total_metrics: number
      excellent: number
      good: number
      warning: number
      critical: number
    }
  }
  message: string
}

export interface KPITrendData {
  date: string
  value: number
  target?: number
}

export interface KPITrendResponse {
  success: boolean
  data: {
    metric_id: string
    metric_name: string
    trends: KPITrendData[]
    period: string
  }
  message: string
}

export interface DepartmentKPIResponse {
  success: boolean
  data: {
    department_id: string
    department_name: string
    kpis: Partial<SystemKPIs>
    metrics: KPIMetric[]
  }
  message: string
}

// ============================================================================
// KPI SERVICE API
// ============================================================================

const KPI_API_BASE = '/kpi'

export const kpiService = {
  /**
   * Get all system KPIs
   */
  getSystemKPIs: async (): Promise<KPIResponse> => {
    try {
      console.log('[KPI-SERVICE] 📊 Fetching system KPIs...')

      const response = await apiClient.get<KPIResponse>(`${KPI_API_BASE}/system`)

      console.log('[KPI-SERVICE] ✅ System KPIs fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch system KPIs:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch system KPIs')
    }
  },

  /**
   * Get KPI metrics with filtering
   */
  getMetrics: async (params?: {
    category?: string
    status?: string
    limit?: number
  }): Promise<MetricsResponse> => {
    try {
      console.log('[KPI-SERVICE] 📈 Fetching KPI metrics...', params)

      const response = await apiClient.get<MetricsResponse>(`${KPI_API_BASE}/metrics`, {
        params: {
          category: params?.category,
          status: params?.status,
          limit: params?.limit || 50,
        },
      })

      console.log('[KPI-SERVICE] ✅ Metrics fetched:', response.data.data.metrics.length)
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch metrics:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch metrics')
    }
  },

  /**
   * Get metrics by category
   */
  getMetricsByCategory: async (
    category: 'asset' | 'ticket' | 'financial' | 'user' | 'operational'
  ): Promise<MetricsResponse> => {
    try {
      console.log('[KPI-SERVICE] 📊 Fetching metrics for category:', category)

      const response = await apiClient.get<MetricsResponse>(
        `${KPI_API_BASE}/metrics/category/${category}`
      )

      console.log('[KPI-SERVICE] ✅ Category metrics fetched:', category)
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch category metrics:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch category metrics')
    }
  },

  /**
   * Get single KPI metric by ID
   */
  getMetricById: async (id: string): Promise<{ success: boolean; data: KPIMetric }> => {
    try {
      console.log('[KPI-SERVICE] 🔍 Fetching metric:', id)

      const response = await apiClient.get(`${KPI_API_BASE}/metrics/${id}`)

      console.log('[KPI-SERVICE] ✅ Metric fetched:', id)
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch metric:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch metric')
    }
  },

  /**
   * Get KPI trend data for a specific metric
   */
  getMetricTrend: async (
    metricId: string,
    params?: {
      period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
      start_date?: string
      end_date?: string
    }
  ): Promise<KPITrendResponse> => {
    try {
      console.log('[KPI-SERVICE] 📉 Fetching trend for metric:', metricId, params)

      const response = await apiClient.get<KPITrendResponse>(
        `${KPI_API_BASE}/metrics/${metricId}/trend`,
        {
          params: {
            period: params?.period || 'monthly',
            start_date: params?.start_date,
            end_date: params?.end_date,
          },
        }
      )

      console.log('[KPI-SERVICE] ✅ Trend data fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch trend:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch trend data')
    }
  },

  /**
   * Get department-specific KPIs
   */
  getDepartmentKPIs: async (departmentId: string): Promise<DepartmentKPIResponse> => {
    try {
      console.log('[KPI-SERVICE] 🏢 Fetching department KPIs:', departmentId)

      const response = await apiClient.get<DepartmentKPIResponse>(
        `${KPI_API_BASE}/departments/${departmentId}`
      )

      console.log('[KPI-SERVICE] ✅ Department KPIs fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch department KPIs:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch department KPIs')
    }
  },

  /**
   * Get user/team KPIs
   */
  getUserKPIs: async (userId: string): Promise<any> => {
    try {
      console.log('[KPI-SERVICE] 👤 Fetching user KPIs:', userId)

      const response = await apiClient.get(`${KPI_API_BASE}/users/${userId}`)

      console.log('[KPI-SERVICE] ✅ User KPIs fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch user KPIs:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch user KPIs')
    }
  },

  /**
   * Refresh KPI calculations (admin only)
   */
  refreshKPIs: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[KPI-SERVICE] 🔄 Refreshing KPIs...')

      const response = await apiClient.post(`${KPI_API_BASE}/refresh`)

      console.log('[KPI-SERVICE] ✅ KPIs refreshed')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to refresh KPIs:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to refresh KPIs')
    }
  },

  /**
   * Get KPI dashboard summary
   */
  getDashboardSummary: async (): Promise<any> => {
    try {
      console.log('[KPI-SERVICE] 📊 Fetching dashboard summary...')

      const response = await apiClient.get(`${KPI_API_BASE}/dashboard`)

      console.log('[KPI-SERVICE] ✅ Dashboard summary fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch dashboard:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary')
    }
  },

  /**
   * Export KPI report
   */
  exportKPIReport: async (params?: {
    format?: 'pdf' | 'xlsx' | 'csv'
    period?: string
    categories?: string[]
  }): Promise<Blob> => {
    try {
      console.log('[KPI-SERVICE] 📥 Exporting KPI report...', params)

      const response = await apiClient.get(`${KPI_API_BASE}/export`, {
        params: {
          format: params?.format || 'xlsx',
          period: params?.period,
          categories: params?.categories?.join(','),
        },
        responseType: 'blob',
      })

      console.log('[KPI-SERVICE] ✅ Report exported')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to export report:', error.message)
      throw new Error('Failed to export KPI report')
    }
  },

  /**
   * Get KPI alerts (metrics below threshold)
   */
  getKPIAlerts: async (): Promise<any> => {
    try {
      console.log('[KPI-SERVICE] 🚨 Fetching KPI alerts...')

      const response = await apiClient.get(`${KPI_API_BASE}/alerts`)

      console.log('[KPI-SERVICE] ✅ Alerts fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch alerts:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch KPI alerts')
    }
  },

  /**
   * Get comparative analysis (current vs previous period)
   */
  getComparativeAnalysis: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year'
  }): Promise<any> => {
    try {
      console.log('[KPI-SERVICE] 📊 Fetching comparative analysis...', params)

      const response = await apiClient.get(`${KPI_API_BASE}/comparative`, {
        params: {
          period: params?.period || 'month',
        },
      })

      console.log('[KPI-SERVICE] ✅ Comparative analysis fetched')
      return response.data
    } catch (error: any) {
      console.error('[KPI-SERVICE] ❌ Failed to fetch analysis:', error.response?.data?.message)
      throw new Error(error.response?.data?.message || 'Failed to fetch comparative analysis')
    }
  },
}

export default kpiService
