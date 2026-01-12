import client from './client';

// ============================================
// INTERFACES & TYPES
// ============================================

/**
 * Audit Log Entry
 */
export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  module: string;
  description: string;
  ip_address: string;
  user_agent: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  created_at: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failed';
}

/**
 * Pagination metadata
 */
export interface AuditLogPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

/**
 * Audit logs API response
 */
export interface AuditLogsResponse {
  data: AuditLog[];
  pagination: AuditLogPagination;
}

/**
 * Filters for fetching audit logs
 */
export interface AuditLogFilters {
  page?: number;
  per_page?: number;
  user_id?: number;
  action?: string;
  module?: string;
  severity?: string;
  status?: string;
  ip_address?: string;
  date_from?: string;
  date_to?: string;
  search?: string; // Search across description, user_name, user_email
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Export request
 */
export interface ExportRequest {
  format: ExportFormat;
  filters?: AuditLogFilters;
}

/**
 * Statistics response
 */
export interface AuditStatistics {
  total_logs: number;
  today_logs: number;
  week_logs: number;
  month_logs: number;
  top_actions?: Array<{
    action: string;
    count: number;
  }>;
  top_users?: Array<{
    user_id: number;
    username: string;
    count: number;
  }>;
  top_modules?: Array<{
    module: string;
    count: number;
  }>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ============================================
// API SERVICE METHODS
// ============================================

/**
 * Fetch audit logs with filters and pagination
 * 
 * @param filters - Filter options for fetching logs
 * @returns Promise with paginated audit logs
 */
export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<ApiResponse<AuditLogsResponse>> => {
  try {
    const response = await client.get('/audit/logs', {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
  }
};

/**
 * Fetch a single audit log by ID
 * 
 * @param id - Audit log ID
 * @returns Promise with audit log details
 */
export const getAuditLogById = async (
  id: number
): Promise<ApiResponse<AuditLog>> => {
  try {
    const response = await client.get(`/audit/logs/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit log details');
  }
};

/**
 * Export audit logs to specified format
 * 
 * @param exportRequest - Export format and filters
 * @returns Promise with file download blob
 */
export const exportAuditLogs = async (
  exportRequest: ExportRequest
): Promise<Blob> => {
  try {
    const response = await client.post('/audit/logs/export', exportRequest, {
      responseType: 'blob', // Important for file download
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to export audit logs');
  }
};

/**
 * Get audit log statistics
 * 
 * @returns Promise with audit statistics
 */
export const getAuditStatistics = async (): Promise<ApiResponse<AuditStatistics>> => {
  try {
    const response = await client.get('/audit/statistics');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit statistics');
  }
};

/**
 * Get unique actions for filter dropdown
 * 
 * @returns Promise with array of unique actions
 */
export const getAvailableActions = async (): Promise<ApiResponse<string[]>> => {
  try {
    const response = await client.get('/audit/actions');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available actions');
  }
};

/**
 * Get unique modules for filter dropdown
 * 
 * @returns Promise with array of unique modules
 */
export const getAvailableModules = async (): Promise<ApiResponse<string[]>> => {
  try {
    const response = await client.get('/audit/modules');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available modules');
  }
};

/**
 * Delete old audit logs (retention policy)
 * 
 * @param daysToKeep - Number of days to retain logs
 * @returns Promise with deletion result
 */
export const purgeOldLogs = async (
  daysToKeep: number
): Promise<ApiResponse<{ deleted_count: number }>> => {
  try {
    const response = await client.post('/audit/logs/purge', { days_to_keep: daysToKeep });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to purge old logs');
  }
};

// Export all methods
export default {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs,
  getAuditStatistics,
  getAvailableActions,
  getAvailableModules,
  purgeOldLogs,
};
