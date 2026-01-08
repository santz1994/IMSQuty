/**
 * useDashboard Hook
 * React hook for dashboard data and role-based dashboards
 */

import { useCallback, useEffect, useState } from 'react'
import dashboardRepository from '../repositories/DashboardRepository'
import {
  Activity,
  DashboardStats,
  MaintenanceSchedule,
  RoleBasedDashboard,
  TrendData,
  WarrantyExpiring
} from '../services/DashboardService'

interface UseDashboardResult {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  refreshStats: () => Promise<void>
}

interface UseRoleDashboardResult {
  dashboard: RoleBasedDashboard | null
  loading: boolean
  error: string | null
  fetchDashboard: (roleId?: number) => Promise<void>
  refreshDashboard: () => Promise<void>
}

/**
 * Main dashboard statistics hook
 */
export function useDashboard(autoFetch: boolean = false): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getStats()
      if (data) {
        setStats(data)
      } else {
        setError('Failed to fetch dashboard statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    await fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }
  }, [autoFetch, fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  }
}

/**
 * Role-based dashboard hook
 */
export function useRoleDashboard(roleId?: number, autoFetch: boolean = false): UseRoleDashboardResult {
  const [dashboard, setDashboard] = useState<RoleBasedDashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (fetchRoleId?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getRoleDashboard(fetchRoleId || roleId)
      if (data) {
        setDashboard(data)
      } else {
        setError('Failed to fetch role dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [roleId])

  const refreshDashboard = useCallback(async () => {
    await fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    if (autoFetch) {
      fetchDashboard()
    }
  }, [autoFetch, fetchDashboard])

  return {
    dashboard,
    loading,
    error,
    fetchDashboard,
    refreshDashboard,
  }
}

/**
 * Hook for recent activities
 */
export function useRecentActivities(limit: number = 10, autoFetch: boolean = false) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getRecentActivities(limit)
      if (data) {
        setActivities(data)
      } else {
        setError('Failed to fetch activities')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (autoFetch) {
      fetchActivities()
    }
  }, [autoFetch, fetchActivities])

  return { activities, loading, error, fetchActivities }
}

/**
 * Hook for maintenance schedule
 */
export function useMaintenanceSchedule(days: number = 30, autoFetch: boolean = false) {
  const [schedule, setSchedule] = useState<MaintenanceSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getMaintenanceSchedule(days)
      if (data) {
        setSchedule(data)
      } else {
        setError('Failed to fetch maintenance schedule')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    if (autoFetch) {
      fetchSchedule()
    }
  }, [autoFetch, fetchSchedule])

  return { schedule, loading, error, fetchSchedule }
}

/**
 * Hook for warranties expiring
 */
export function useWarrantiesExpiring(days: number = 90, autoFetch: boolean = false) {
  const [warranties, setWarranties] = useState<WarrantyExpiring[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWarranties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getWarrantiesExpiring(days)
      if (data) {
        setWarranties(data)
      } else {
        setError('Failed to fetch expiring warranties')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    if (autoFetch) {
      fetchWarranties()
    }
  }, [autoFetch, fetchWarranties])

  return { warranties, loading, error, fetchWarranties }
}

/**
 * Hook for asset trends
 */
export function useAssetTrends(period: 'week' | 'month' | 'quarter' | 'year' = 'month', autoFetch: boolean = false) {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getAssetTrends(period)
      if (data) {
        setTrends(data)
      } else {
        setError('Failed to fetch asset trends')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    if (autoFetch) {
      fetchTrends()
    }
  }, [autoFetch, fetchTrends])

  return { trends, loading, error, fetchTrends }
}

/**
 * Hook for ticket trends
 */
export function useTicketTrends(period: 'week' | 'month' | 'quarter' | 'year' = 'month', autoFetch: boolean = false) {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrends = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardRepository.getTicketTrends(period)
      if (data) {
        setTrends(data)
      } else {
        setError('Failed to fetch ticket trends')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    if (autoFetch) {
      fetchTrends()
    }
  }, [autoFetch, fetchTrends])

  return { trends, loading, error, fetchTrends }
}

export default useDashboard
