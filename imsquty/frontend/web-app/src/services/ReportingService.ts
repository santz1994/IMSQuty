/**
 * Reporting Service
 * Handles report generation and export operations
 */

import { formatDateID } from '../utils/dateTimeFormat'
import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface Report {
  id: number
  name: string
  type: 'asset' | 'ticket' | 'financial' | 'inventory' | 'user' | 'custom'
  description?: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string
  file_size?: number
  generated_by: number
  generated_by_name?: string
  parameters?: any
  schedule?: string
  created_at: string
  completed_at?: string
}

export interface ReportTemplate {
  id: number
  name: string
  type: 'asset' | 'ticket' | 'financial' | 'inventory' | 'user' | 'custom'
  description?: string
  fields: string[]
  filters?: any
  created_at?: string
}

export interface GenerateReportData {
  type: 'asset' | 'ticket' | 'financial' | 'inventory' | 'user' | 'custom'
  name: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  date_from?: string
  date_to?: string
  filters?: any
  fields?: string[]
  template_id?: number
}

export interface ScheduleReportData {
  template_id: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  recipients?: string[]
  enabled: boolean
}

export interface ReportStats {
  total_reports: number
  pending: number
  completed: number
  failed: number
  by_type: {
    asset: number
    ticket: number
    financial: number
    inventory: number
    user: number
    custom: number
  }
  total_size: number
}

class ReportingService extends BaseService {
  constructor() {
    super('/reporting')
  }

  // ========== REPORTS ==========

  /**
   * Get all reports with pagination
   */
  async getReports(params?: PaginationParams): Promise<ServiceResponse<Report[]>> {
    try {
      const response = await this.get<Report[]>('/reports', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single report
   */
  async getReport(id: number): Promise<ServiceResponse<Report>> {
    try {
      const response = await this.get<Report>(`/reports/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Generate new report
   */
  async generateReport(data: GenerateReportData): Promise<ServiceResponse<Report>> {
    try {
      const response = await this.post<Report>('/reports/generate', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete report
   */
  async deleteReport(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/reports/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Download report file
   */
  async downloadReport(id: number): Promise<Blob> {
    try {
      const response = await this.downloadFile(`/reports/${id}/download`)
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Regenerate failed report
   */
  async regenerateReport(id: number): Promise<ServiceResponse<Report>> {
    try {
      const response = await this.post<Report>(`/reports/${id}/regenerate`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== TEMPLATES ==========

  /**
   * Get all report templates
   */
  async getTemplates(params?: PaginationParams): Promise<ServiceResponse<ReportTemplate[]>> {
    try {
      const response = await this.get<ReportTemplate[]>('/templates', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single template
   */
  async getTemplate(id: number): Promise<ServiceResponse<ReportTemplate>> {
    try {
      const response = await this.get<ReportTemplate>(`/templates/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create report template
   */
  async createTemplate(data: Omit<ReportTemplate, 'id' | 'created_at'>): Promise<ServiceResponse<ReportTemplate>> {
    try {
      const response = await this.post<ReportTemplate>('/templates', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update report template
   */
  async updateTemplate(id: number, data: Partial<ReportTemplate>): Promise<ServiceResponse<ReportTemplate>> {
    try {
      const response = await this.put<ReportTemplate>(`/templates/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete report template
   */
  async deleteTemplate(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/templates/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== SCHEDULED REPORTS ==========

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ServiceResponse<ScheduleReportData[]>> {
    try {
      const response = await this.get<ScheduleReportData[]>('/scheduled')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Schedule a report
   */
  async scheduleReport(data: ScheduleReportData): Promise<ServiceResponse<any>> {
    try {
      const response = await this.post<any>('/scheduled', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(id: number, data: Partial<ScheduleReportData>): Promise<ServiceResponse<any>> {
    try {
      const response = await this.put<any>(`/scheduled/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/scheduled/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== STATISTICS ==========

  /**
   * Get reporting statistics
   */
  async getStats(): Promise<ServiceResponse<ReportStats>> {
    try {
      const response = await this.get<ReportStats>('/stats')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== QUICK REPORTS ==========

  /**
   * Generate Asset Report
   */
  async generateAssetReport(format: 'pdf' | 'excel' | 'csv' = 'excel'): Promise<ServiceResponse<Report>> {
    return this.generateReport({
      type: 'asset',
      name: `Asset Report - ${formatDateID(new Date())}`,
      format
    })
  }

  /**
   * Generate Ticket Report
   */
  async generateTicketReport(format: 'pdf' | 'excel' | 'csv' = 'excel'): Promise<ServiceResponse<Report>> {
    return this.generateReport({
      type: 'ticket',
      name: `Ticket Report - ${formatDateID(new Date())}`,
      format
    })
  }

  /**
   * Generate Financial Report
   */
  async generateFinancialReport(format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<ServiceResponse<Report>> {
    return this.generateReport({
      type: 'financial',
      name: `Financial Report - ${formatDateID(new Date())}`,
      format
    })
  }

  /**
   * Generate Inventory Report
   */
  async generateInventoryReport(format: 'pdf' | 'excel' | 'csv' = 'excel'): Promise<ServiceResponse<Report>> {
    return this.generateReport({
      type: 'inventory',
      name: `Inventory Report - ${formatDateID(new Date())}`,
      format
    })
  }
}

// Export singleton instance
export const reportingService = new ReportingService()
export default reportingService

