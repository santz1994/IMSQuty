/**
 * useKPI Hook
 * React hook for KPI (Key Performance Indicators) management - REAL API ONLY
 */

import { useCallback, useEffect, useState } from 'react'
import kpiService, { KPIMetric, SystemKPIs } from '../api/kpiService'

interface UseKPIResult {
  kpis: SystemKPIs | null
  metrics: KPIMetric[]
  loading: boolean
  error: string | null
  fetchKPIs: () => Promise<void>
  refreshKPIs: () => Promise<void>
  getMetricsByCategory: (category: string) => KPIMetric[]
  getDashboardSummary: () => Promise<any>
  getMetricTrend: (metricId: string, period?: string) => Promise<any>
}

/**
 * Main KPI hook - uses REAL API CALLS to reporting/analytics service
 */
export function useKPI(autoFetch: boolean = false): UseKPIResult {
  const [kpis, setKPIs] = useState<SystemKPIs | null>(null)
  const [metrics, setMetrics] = useState<KPIMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKPIs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useKPI] 📊 Fetching KPIs from API...')

      // Fetch system KPIs
      const kpiResponse = await kpiService.getSystemKPIs()
      setKPIs(kpiResponse.data)

      // Fetch metrics
      const metricsResponse = await kpiService.getMetrics()
      setMetrics(metricsResponse.data.metrics)

      console.log('[useKPI] ✅ KPIs loaded:', metricsResponse.data.metrics.length, 'metrics')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch KPIs'
      setError(errorMsg)
      console.error('[useKPI] ❌ Error:', errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshKPIs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[useKPI] 🔄 Refreshing KPIs...')

      // Refresh KPI calculations on server
      await kpiService.refreshKPIs()

      // Fetch updated data
      await fetchKPIs()

      console.log('[useKPI] ✅ KPIs refreshed')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh KPIs'
      setError(errorMsg)
      console.error('[useKPI] ❌ Error:', errorMsg)
    } finally {
      setLoading(false)
    }
  }, [fetchKPIs])

  const getMetricsByCategory = useCallback((category: string): KPIMetric[] => {
    console.log('[useKPI] 🔍 Filtering metrics by category:', category)
    return metrics.filter(m => m.category === category)
  }, [metrics])

  const getDashboardSummary = useCallback(async () => {
    try {
      console.log('[useKPI] 📊 Fetching dashboard summary...')
      const response = await kpiService.getDashboardSummary()
      console.log('[useKPI] ✅ Dashboard summary fetched')
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch dashboard summary'
      console.error('[useKPI] ❌ Error:', errorMsg)
      throw err
    }
  }, [])

  const getMetricTrend = useCallback(async (metricId: string, period: string = 'monthly') => {
    try {
      console.log('[useKPI] 📈 Fetching trend for metric:', metricId, period)
      const response = await kpiService.getMetricTrend(metricId, {
        period: period as 'daily' | 'weekly' | 'monthly' | 'yearly'
      })
      console.log('[useKPI] ✅ Trend data fetched')
      return response.data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch metric trend'
      console.error('[useKPI] ❌ Error:', errorMsg)
      throw err
    }
  }, [])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchKPIs()
    }
  }, [autoFetch, fetchKPIs])

  return {
    kpis,
    metrics,
    loading,
    error,
    fetchKPIs,
    refreshKPIs,
    getMetricsByCategory,
    getDashboardSummary,
    getMetricTrend,
  }
}

export default useKPI
