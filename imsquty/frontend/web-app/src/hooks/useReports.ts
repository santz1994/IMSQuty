/**
 * Reporting Hook - Custom React hook for report operations
 */
import { useCallback, useEffect, useState } from 'react'
import reportingService, { GenerateReportData, Report, ReportTemplate } from '../services/ReportingService'

export const useReports = (autoFetch = false) => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reportingService.getReports()
      if (response.success && response.data) {
        setReports(response.data)
      } else {
        setError(response.message || 'Failed to fetch reports')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const generateReport = useCallback(async (data: GenerateReportData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reportingService.generateReport(data)
      if (response.success) {
        await fetchReports()
        return response.data
      } else {
        setError(response.message || 'Failed to generate report')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchReports])

  const deleteReport = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reportingService.deleteReport(id)
      if (response.success) {
        await fetchReports()
        return true
      } else {
        setError(response.message || 'Failed to delete report')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchReports])

  const downloadReport = useCallback(async (id: number, filename?: string) => {
    setLoading(true)
    setError(null)
    try {
      const blob = await reportingService.downloadReport(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `report-${id}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return true
    } catch (err: any) {
      setError(err.message || 'An error occurred while downloading')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchReports()
    }
  }, [autoFetch, fetchReports])

  return {
    reports,
    loading,
    error,
    fetchReports,
    generateReport,
    deleteReport,
    downloadReport
  }
}

export const useReportTemplates = (autoFetch = false) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await reportingService.getTemplates()
      if (response.success && response.data) {
        setTemplates(response.data)
      } else {
        setError(response.message || 'Failed to fetch templates')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates()
    }
  }, [autoFetch, fetchTemplates])

  return { templates, loading, error, fetchTemplates }
}
