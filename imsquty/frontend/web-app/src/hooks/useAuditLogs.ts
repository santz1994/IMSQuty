/**
 * Audit Log Hook - Custom React hook for audit log operations
 */
import { useCallback, useEffect, useState } from 'react'
import auditLogService, { AuditLog, AuditLogFilters } from '../services/AuditLogService'

export const useAuditLogs = (autoFetch = false, filters?: AuditLogFilters) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditLogs = useCallback(async (customFilters?: AuditLogFilters) => {
    setLoading(true)
    setError(null)
    try {
      const response = await auditLogService.getAuditLogs(customFilters || filters)
      if (response.success && response.data) {
        setAuditLogs(response.data)
      } else {
        setError(response.message || 'Failed to fetch audit logs')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const searchAuditLogs = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await auditLogService.searchAuditLogs(query)
      if (response.success && response.data) {
        setAuditLogs(response.data)
      } else {
        setError(response.message || 'Search failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const exportAuditLogs = useCallback(async (format: 'csv' | 'excel' | 'json' = 'excel', exportFilters?: AuditLogFilters) => {
    setLoading(true)
    setError(null)
    try {
      const blob = await auditLogService.exportAuditLogs(format, exportFilters || filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return true
    } catch (err: any) {
      setError(err.message || 'Export failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (autoFetch) {
      fetchAuditLogs()
    }
  }, [autoFetch, fetchAuditLogs])

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
    searchAuditLogs,
    exportAuditLogs
  }
}
