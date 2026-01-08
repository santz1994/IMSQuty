import { formatTimeID } from '../utils/dateTimeFormat'
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
   * Aggregates health from all microservices + infrastructure
   */
  getSystemHealth: async () => {
    try {
      // Define all 10 microservices
      const microservices = [
        { name: 'Auth Service', endpoint: '/auth/health', port: 8000 },
        { name: 'Asset Service', endpoint: '/assets/health', port: 8001 },
        { name: 'Ticket Service', endpoint: '/tickets/health', port: 8002 },
        { name: 'Meeting Room Service', endpoint: '/meeting-rooms/health', port: 8003 },
        { name: 'Inventory Service', endpoint: '/inventory/health', port: 8004 },
        { name: 'Financial Service', endpoint: '/financial/health', port: 8005 },
        { name: 'User Service', endpoint: '/users/health', port: 8006 },
        { name: 'Notification Service', endpoint: '/notifications/health', port: 8007 },
        { name: 'Reporting Service', endpoint: '/reporting/health', port: 8008 },
        { name: 'Master Data Service', endpoint: '/master-data/health', port: 8009 },
      ]

      // Make parallel health check requests
      const startTime = Date.now()
      const healthPromises = microservices.map(async (service) => {
        try {
          const serviceStartTime = Date.now()
          const response = await apiClient.get(service.endpoint, {
            timeout: 5000 // 5 second timeout
          })
          const latency = Date.now() - serviceStartTime

          return {
            name: service.name,
            status: response.data?.status === 'healthy' ? 'healthy' : 'unhealthy',
            latency,
            port: service.port,
            timestamp: response.data?.timestamp,
            checks: response.data?.checks || {}
          }
        } catch (error) {
          return {
            name: service.name,
            status: 'down',
            latency: 0,
            port: service.port,
            error: error instanceof Error ? error.message : 'Connection failed'
          }
        }
      })

      const services = await Promise.all(healthPromises)
      const totalLatency = Date.now() - startTime

      // Calculate system-level statistics
      const healthyCount = services.filter(s => s.status === 'healthy').length
      const warningCount = services.filter(s => s.status === 'warning' || s.latency > 400).length
      const downCount = services.filter(s => s.status === 'down').length

      // Aggregate performance metrics (simplified - in production would come from Prometheus)
      const avgLatency = services.reduce((acc, s) => acc + s.latency, 0) / services.length
      const performance = {
        cpu: {
          usage: Math.round(Math.random() * 30 + 20), // TODO: Replace with real CPU metrics from Prometheus
          max: 100,
          status: healthyCount >= 9 ? 'good' : 'warning'
        },
        memory: {
          used: parseFloat((Math.random() * 4 + 6).toFixed(1)), // TODO: Replace with real memory metrics
          total: 16,
          unit: 'GB',
          status: 'good'
        },
        disk: {
          io: Math.round(avgLatency * 0.5),
          unit: 'MB/s',
          status: 'good'
        },
        network: {
          traffic: Math.round(avgLatency / 5),
          unit: 'Mbps',
          status: avgLatency < 300 ? 'good' : 'warning'
        }
      }

      // Database stats (would come from metrics endpoints in production)
      const database = {
        mysql: {
          connections: Math.round(Math.random() * 100 + 150),
          maxConnections: 500,
          slowQueries: parseFloat((Math.random() * 0.5).toFixed(2)),
          avgLatency: Math.round(avgLatency / 10),
        },
        redis: {
          memory: parseFloat((Math.random() * 1 + 0.5).toFixed(1)),
          maxMemory: 4,
          operations: Math.round(Math.random() * 10000 + 35000),
          hitRate: parseFloat((95 + Math.random() * 3).toFixed(1)),
        },
        queryPerformance: [
          // Last 6 hours of query data (would come from monitoring)
          { time: formatTimeID(Date.now() - 5 * 3600000), queries: 800, slow: 2 },
          { time: formatTimeID(Date.now() - 4 * 3600000), queries: 600, slow: 1 },
          { time: formatTimeID(Date.now() - 3 * 3600000), queries: 700, slow: 0 },
          { time: formatTimeID(Date.now() - 2 * 3600000), queries: 900, slow: 3 },
          { time: formatTimeID(Date.now() - 1 * 3600000), queries: 1200, slow: 5 },
          { time: formatTimeID(Date.now()), queries: 1500, slow: 4 },
        ]
      }

      return {
        status: downCount === 0 ? 'healthy' : downCount < 3 ? 'degraded' : 'unhealthy',
        services,
        performance,
        database,
        summary: {
          total: microservices.length,
          healthy: healthyCount,
          warning: warningCount,
          down: downCount,
          avgLatency: Math.round(avgLatency),
          checkTime: totalLatency
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      return {
        status: 'unknown',
        services: [],
        error: error instanceof Error ? error.message : 'Unknown error'
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
