import apiClient from './client'

/**
 * Dashboard Service - Aggregates statistics from all microservices
 * Provides unified API for dashboard data collection
 */

export interface DashboardStats {
  assets: {
    total: number
    available: number
    in_use: number
    maintenance: number
    retired: number
    byStatus: { name: string; value: number }[]
    byLocation: { name: string; value: number }[]
  }
  tickets: {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
    overdueSLA: number
    byPriority: { name: string; value: number }[]
    byStatus: { name: string; value: number }[]
  }
  inventory: {
    totalItems: number
    lowStock: number
    outOfStock: number
    totalValue: number
    byWarehouse: { name: string; value: number }[]
  }
  financial: {
    totalRevenue: number
    totalExpenses: number
    pendingInvoices: number
    paidInvoices: number
    overdueInvoices: number
    budgetUtilization: number
  }
  meetingRooms: {
    totalRooms: number
    availableNow: number
    bookedToday: number
    utilizationRate: number
  }
  users: {
    total: number
    active: number
    inactive: number
    online: number
    totalUsers: number
    activeUsers: number
    totalDepartments: number
    totalTeams: number
    byRole: { name: string; value: number }[]
    byDepartment: { name: string; value: number }[]
  }
  notifications: {
    totalSent: number
    deliveryRate: number
    byChannel: { name: string; value: number }[]
  }
}

export interface QuickStats {
  totalAssets: number
  openTickets: number
  todayBookings: number
  lowStockItems: number
  pendingInvoices: number
  activeUsers: number
}

export interface TrendData {
  date: string
  assets: number
  tickets: number
  bookings: number
}

export interface RecentActivity {
  id: number
  type: 'asset' | 'ticket' | 'booking' | 'financial' | 'user'
  action: string
  description: string
  user: string
  timestamp: string
}

export const dashboardService = {
  /**
   * Get comprehensive dashboard statistics from all services
   * This method makes parallel requests to all microservices
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Make parallel requests to all services
      const [
        assetsRes,
        ticketsRes,
        inventoryRes,
        financialRes,
        meetingRoomsRes,
        usersRes,
        notificationsRes,
      ] = await Promise.all([
        apiClient.get('/assets/stats').catch(() => ({ data: null })),
        apiClient.get('/tickets/stats').catch(() => ({ data: null })),
        apiClient.get('/inventory/stats').catch(() => ({ data: null })),
        apiClient.get('/financial/stats').catch(() => ({ data: null })),
        apiClient.get('/meeting-rooms/stats').catch(() => ({ data: null })),
        apiClient.get('/users/stats').catch(() => ({ data: null })),
        apiClient.get('/notifications/stats').catch(() => ({ data: null })),
      ])

      // Transform and aggregate data
      return {
        assets: assetsRes.data?.data || {
          total: 0,
          available: 0,
          in_use: 0,
          maintenance: 0,
          retired: 0,
          byStatus: [],
          byLocation: [],
        },
        tickets: ticketsRes.data?.data || {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          overdueSLA: 0,
          byPriority: [],
          byStatus: [],
        },
        inventory: inventoryRes.data?.data || {
          totalItems: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          byWarehouse: [],
        },
        financial: financialRes.data?.data || {
          totalRevenue: 0,
          totalExpenses: 0,
          pendingInvoices: 0,
          paidInvoices: 0,
          overdueInvoices: 0,
          budgetUtilization: 0,
        },
        meetingRooms: meetingRoomsRes.data?.data || {
          totalRooms: 0,
          availableNow: 0,
          bookedToday: 0,
          utilizationRate: 0,
        },
        users: usersRes.data?.data || {
          totalUsers: 0,
          activeUsers: 0,
          totalDepartments: 0,
          totalTeams: 0,
        },
        notifications: notificationsRes.data?.data || {
          totalSent: 0,
          deliveryRate: 0,
          byChannel: [],
        },
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      throw error
    }
  },

  /**
   * Get quick stats for dashboard cards
   * Lightweight version with essential metrics only
   */
  getQuickStats: async (): Promise<QuickStats> => {
    try {
      const response = await apiClient.get('/dashboard/quick-stats')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch quick stats:', error)
      // Return fallback data
      return {
        totalAssets: 0,
        openTickets: 0,
        todayBookings: 0,
        lowStockItems: 0,
        pendingInvoices: 0,
        activeUsers: 0,
      }
    }
  },

  /**
   * Get trend data for charts (last 7/30 days)
   */
  getTrends: async (days: 7 | 30 = 7): Promise<TrendData[]> => {
    try {
      const response = await apiClient.get(`/dashboard/trends?days=${days}`)
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch trends:', error)
      return []
    }
  },

  /**
   * Get recent activity across all modules
   */
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    try {
      const response = await apiClient.get(
        `/dashboard/recent-activity?limit=${limit}`,
      )
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
      return []
    }
  },

  /**
   * Get system health status
   */
  getSystemHealth: async () => {
    try {
      const response = await apiClient.get('/dashboard/health')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      return {
        status: 'unknown',
        services: [],
      }
    }
  },

  /**
   * Role-Specific Dashboard Methods
   */

  // Director Dashboard Methods
  getBusinessMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/director/business-metrics')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch business metrics:', error)
      return null
    }
  },

  getFinancialOverview: async () => {
    try {
      const response = await apiClient.get('/dashboard/director/financial-overview')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch financial overview:', error)
      return null
    }
  },

  getDepartmentPerformance: async () => {
    try {
      const response = await apiClient.get('/dashboard/director/department-performance')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch department performance:', error)
      return []
    }
  },

  getBusinessTrends: async () => {
    try {
      const response = await apiClient.get('/dashboard/director/business-trends')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch business trends:', error)
      return []
    }
  },

  // Manager Dashboard Methods
  getTeamMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/manager/team-metrics')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch team metrics:', error)
      return null
    }
  },

  getPendingApprovals: async () => {
    try {
      const response = await apiClient.get('/dashboard/manager/pending-approvals')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error)
      return []
    }
  },

  // HR Dashboard Methods
  getHRMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/hr/metrics')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch HR metrics:', error)
      return null
    }
  },

  // User Dashboard Methods
  getUserMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/user/metrics')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch user metrics:', error)
      return null
    }
  },
}
