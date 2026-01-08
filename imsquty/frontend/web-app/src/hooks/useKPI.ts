/**
 * useKPI Hook
 * React hook for KPI (Key Performance Indicators) management
 */

import { useCallback, useEffect, useState } from 'react'

export interface KPIMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  change: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  category: 'asset' | 'ticket' | 'financial' | 'user' | 'operational'
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

interface UseKPIResult {
  kpis: SystemKPIs | null
  metrics: KPIMetric[]
  loading: boolean
  error: string | null
  fetchKPIs: () => Promise<void>
  refreshKPIs: () => Promise<void>
  getMetricsByCategory: (category: string) => KPIMetric[]
}

/**
 * Main KPI hook
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
      // Mock KPI data - replace with actual API call
      const mockKPIs: SystemKPIs = {
        // Asset KPIs
        asset_availability: 94.5,
        asset_utilization: 87.2,
        maintenance_completion_rate: 91.8,
        asset_depreciation_rate: 12.3,

        // Ticket KPIs
        ticket_resolution_rate: 89.5,
        ticket_avg_response_time: 2.3, // hours
        ticket_sla_compliance: 95.2,
        ticket_first_contact_resolution: 78.5,
        ticket_customer_satisfaction: 4.3, // out of 5

        // Financial KPIs
        total_asset_value: 15500000,
        maintenance_cost_ratio: 8.5,
        cost_per_ticket: 45000,
        budget_utilization: 82.3,
        roi: 15.7,

        // User KPIs
        user_satisfaction_score: 4.2,
        system_uptime: 99.8,
        active_users_ratio: 85.5,

        // Operational KPIs
        inventory_turnover: 6.5,
        booking_utilization: 73.2,
        process_efficiency: 88.9,
      }

      // Convert to metrics array
      const mockMetrics: KPIMetric[] = [
        {
          id: 'asset_availability',
          name: 'Asset Availability',
          value: 94.5,
          target: 95,
          unit: '%',
          change: +2.3,
          status: 'good',
          category: 'asset',
        },
        {
          id: 'ticket_resolution_rate',
          name: 'Ticket Resolution Rate',
          value: 89.5,
          target: 90,
          unit: '%',
          change: +1.5,
          status: 'good',
          category: 'ticket',
        },
        {
          id: 'sla_compliance',
          name: 'SLA Compliance',
          value: 95.2,
          target: 95,
          unit: '%',
          change: +0.8,
          status: 'excellent',
          category: 'ticket',
        },
        {
          id: 'system_uptime',
          name: 'System Uptime',
          value: 99.8,
          target: 99.5,
          unit: '%',
          change: +0.1,
          status: 'excellent',
          category: 'operational',
        },
        {
          id: 'user_satisfaction',
          name: 'User Satisfaction',
          value: 4.3,
          target: 4.0,
          unit: '/5',
          change: +0.2,
          status: 'excellent',
          category: 'user',
        },
        {
          id: 'budget_utilization',
          name: 'Budget Utilization',
          value: 82.3,
          target: 85,
          unit: '%',
          change: +3.5,
          status: 'good',
          category: 'financial',
        },
      ]

      setKPIs(mockKPIs)
      setMetrics(mockMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshKPIs = useCallback(async () => {
    await fetchKPIs()
  }, [fetchKPIs])

  const getMetricsByCategory = useCallback((category: string): KPIMetric[] => {
    return metrics.filter(m => m.category === category)
  }, [metrics])

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
  }
}

export default useKPI
