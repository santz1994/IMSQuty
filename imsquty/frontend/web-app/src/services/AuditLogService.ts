/**
 * Audit Log Service
 * Handles audit log tracking and retrieval
 */

import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface AuditLog {
  id: number
  user_id: number
  user_name?: string
  user_email?: string
  action: string
  entity_type: string
  entity_id?: number
  description: string
  ip_address?: string
  user_agent?: string
  changes?: {
    before?: any
    after?: any
  }
  metadata?: any
  severity: 'info' | 'warning' | 'error' | 'critical'
  created_at: string
}

export interface AuditLogFilters extends PaginationParams {
  user_id?: number
  action?: string
  entity_type?: string
  entity_id?: number
  severity?: 'info' | 'warning' | 'error' | 'critical'
  date_from?: string
  date_to?: string
}

export interface AuditLogStats {
  total: number
  by_action: {
    created: number
    updated: number
    deleted: number
    viewed: number
    exported: number
    login: number
    logout: number
    other: number
  }
  by_severity: {
    info: number
    warning: number
    error: number
    critical: number
  }
  by_entity_type: {
    [key: string]: number
  }
  by_user: {
    user_id: number
    user_name: string
    count: number
  }[]
  recent_critical: AuditLog[]
}

export interface ActivitySummary {
  today: number
  this_week: number
  this_month: number
  trend: {
    date: string
    count: number
  }[]
}

class AuditLogService extends BaseService {
  constructor() {
    super('/audit-logs')
  }

  /**
   * Get all audit logs with pagination and filters
   */
  async getAuditLogs(params?: AuditLogFilters): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>('', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single audit log
   */
  async getAuditLog(id: number): Promise<ServiceResponse<AuditLog>> {
    try {
      const response = await this.get<AuditLog>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get audit logs for specific entity
   */
  async getEntityAuditLogs(entityType: string, entityId: number): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>(`/entity/${entityType}/${entityId}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get audit logs for specific user
   */
  async getUserAuditLogs(userId: number, params?: PaginationParams): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>(`/user/${userId}`, params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get current user's audit logs
   */
  async getMyAuditLogs(params?: PaginationParams): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>('/my', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get critical audit logs (security events)
   */
  async getCriticalLogs(): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>('/critical')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get recent activity (last 24 hours)
   */
  async getRecentActivity(): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>('/recent')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get audit log statistics
   */
  async getStats(dateFrom?: string, dateTo?: string): Promise<ServiceResponse<AuditLogStats>> {
    try {
      const response = await this.get<AuditLogStats>('/stats', {
        date_from: dateFrom,
        date_to: dateTo
      })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get activity summary
   */
  async getActivitySummary(): Promise<ServiceResponse<ActivitySummary>> {
    try {
      const response = await this.get<ActivitySummary>('/activity-summary')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(format: 'csv' | 'excel' | 'json' = 'excel', filters?: AuditLogFilters): Promise<Blob> {
    try {
      const params = { ...filters, format }
      const response = await this.downloadFile('/export', params)
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: string, params?: PaginationParams): Promise<ServiceResponse<AuditLog[]>> {
    try {
      const response = await this.get<AuditLog[]>('/search', {
        ...params,
        q: query
      })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get unique actions (for filter dropdown)
   */
  async getUniqueActions(): Promise<ServiceResponse<string[]>> {
    try {
      const response = await this.get<string[]>('/actions')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get unique entity types (for filter dropdown)
   */
  async getUniqueEntityTypes(): Promise<ServiceResponse<string[]>> {
    try {
      const response = await this.get<string[]>('/entity-types')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete old audit logs (admin only)
   */
  async deleteOldLogs(olderThan: string): Promise<ServiceResponse<{ deleted: number }>> {
    try {
      const response = await this.delete<{ deleted: number }>('/cleanup', {
        older_than: olderThan
      })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService()
export default auditLogService

