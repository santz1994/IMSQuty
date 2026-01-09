import client from './client'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface ApplicationSettings {
  app_name: string
  app_version: string
  app_url: string
  app_timezone: string
  app_locale: string
  company_name?: string
  company_logo?: string
}

export interface EmailSettings {
  mail_driver: string
  mail_host: string
  mail_port: number
  mail_username: string
  mail_password: string
  mail_encryption: string
  mail_from_address: string
  mail_from_name: string
}

export interface StorageSettings {
  storage_driver: string
  minio_endpoint: string
  minio_bucket: string
  minio_access_key: string
  minio_secret_key: string
  minio_region: string
  max_upload_size: number
}

export interface QueueSettings {
  queue_connection: string
  rabbitmq_host: string
  rabbitmq_port: number
  rabbitmq_user: string
  rabbitmq_password: string
  rabbitmq_vhost: string
}

export interface CacheSettings {
  cache_driver: string
  redis_host: string
  redis_port: number
  redis_password: string
  redis_database: number
  cache_ttl: number
}

export interface SecuritySettings {
  session_timeout: number
  max_login_attempts: number
  enable_2fa: boolean
  enable_audit_logging: boolean
  enable_api_throttling: boolean
  api_throttle_rate: number
}

export interface MaintenanceSettings {
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_allowed_ips: string[]
}

export interface AllSettings {
  application: ApplicationSettings
  email: EmailSettings
  storage: StorageSettings
  queue: QueueSettings
  cache: CacheSettings
  security: SecuritySettings
  maintenance: MaintenanceSettings
}

export interface UpdateSettingsRequest {
  category: 'application' | 'email' | 'storage' | 'queue' | 'cache' | 'security' | 'maintenance'
  settings: Partial<ApplicationSettings | EmailSettings | StorageSettings | QueueSettings | CacheSettings | SecuritySettings | MaintenanceSettings>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface QueueStats {
  pending_jobs: number
  failed_jobs: number
  processed_jobs: number
  workers_active: number
  queue_status: 'running' | 'stopped' | 'error'
}

export interface CacheStats {
  total_keys: number
  memory_used: string
  memory_limit: string
  hit_rate: number
  connections: number
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

class SettingsService {
  /**
   * Get all system settings
   */
  async getAllSettings(): Promise<ApiResponse<AllSettings>> {
    const response = await client.get<ApiResponse<AllSettings>>('/api/settings')
    return response.data
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<ApiResponse<any>> {
    const response = await client.get<ApiResponse<any>>(`/api/settings/${category}`)
    return response.data
  }

  /**
   * Update settings for a specific category
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<ApiResponse<any>> {
    const response = await client.put<ApiResponse<any>>(`/api/settings/${data.category}`, data.settings)
    return response.data
  }

  /**
   * Test email configuration
   */
  async testEmailSettings(emailSettings: Partial<EmailSettings>): Promise<ApiResponse<{ message: string }>> {
    const response = await client.post<ApiResponse<{ message: string }>>('/api/settings/email/test', emailSettings)
    return response.data
  }

  /**
   * Test storage connection (MinIO)
   */
  async testStorageSettings(storageSettings: Partial<StorageSettings>): Promise<ApiResponse<{ message: string }>> {
    const response = await client.post<ApiResponse<{ message: string }>>('/api/settings/storage/test', storageSettings)
    return response.data
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<ApiResponse<QueueStats>> {
    const response = await client.get<ApiResponse<QueueStats>>('/api/settings/queue/stats')
    return response.data
  }

  /**
   * Clear failed queue jobs
   */
  async clearFailedJobs(): Promise<ApiResponse<{ message: string, cleared_count: number }>> {
    const response = await client.post<ApiResponse<{ message: string, cleared_count: number }>>('/api/settings/queue/clear-failed')
    return response.data
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<ApiResponse<CacheStats>> {
    const response = await client.get<ApiResponse<CacheStats>>('/api/settings/cache/stats')
    return response.data
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    const response = await client.post<ApiResponse<{ message: string }>>('/api/settings/cache/clear')
    return response.data
  }

  /**
   * Flush specific cache keys by pattern
   */
  async flushCacheByPattern(pattern: string): Promise<ApiResponse<{ message: string, flushed_count: number }>> {
    const response = await client.post<ApiResponse<{ message: string, flushed_count: number }>>('/api/settings/cache/flush', { pattern })
    return response.data
  }

  /**
   * Enable/disable maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<ApiResponse<{ message: string }>> {
    const response = await client.post<ApiResponse<{ message: string }>>('/api/settings/maintenance', {
      enabled,
      message: message || 'System is under maintenance. Please check back later.'
    })
    return response.data
  }
}

export default new SettingsService()
