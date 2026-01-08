/**
 * Notification Service
 * Handles notification management and delivery
 */

import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface Notification {
  id: number
  user_id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  read: boolean
  read_at?: string
  action_url?: string
  category: 'system' | 'task' | 'approval' | 'reminder' | 'alert'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at?: string
}

export interface CreateNotificationData {
  user_id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  action_url?: string
  category?: 'system' | 'task' | 'approval' | 'reminder' | 'alert'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  categories: {
    system: boolean
    task: boolean
    approval: boolean
    reminder: boolean
    alert: boolean
  }
}

export interface NotificationStats {
  total: number
  unread: number
  by_type: {
    info: number
    success: number
    warning: number
    error: number
  }
  by_category: {
    system: number
    task: number
    approval: number
    reminder: number
    alert: number
  }
}

class NotificationService extends BaseService {
  constructor() {
    super('/notifications')
  }

  /**
   * Get all notifications for current user
   */
  async getNotifications(params?: PaginationParams): Promise<ServiceResponse<Notification[]>> {
    try {
      const response = await this.get<Notification[]>('', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<ServiceResponse<Notification[]>> {
    try {
      const response = await this.get<Notification[]>('/unread')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single notification
   */
  async getNotification(id: number): Promise<ServiceResponse<Notification>> {
    try {
      const response = await this.get<Notification>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<ServiceResponse<Notification>> {
    try {
      const response = await this.post<Notification>(`/${id}/read`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ServiceResponse<void>> {
    try {
      const response = await this.post<void>('/read-all', {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>('/read')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<ServiceResponse<NotificationStats>> {
    try {
      const response = await this.get<NotificationStats>('/stats')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ServiceResponse<NotificationPreferences>> {
    try {
      const response = await this.get<NotificationPreferences>('/preferences')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(data: Partial<NotificationPreferences>): Promise<ServiceResponse<NotificationPreferences>> {
    try {
      const response = await this.put<NotificationPreferences>('/preferences', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Send notification (admin only)
   */
  async sendNotification(data: CreateNotificationData): Promise<ServiceResponse<Notification>> {
    try {
      const response = await this.post<Notification>('/send', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Broadcast notification to multiple users (admin only)
   */
  async broadcastNotification(data: CreateNotificationData & { user_ids: number[] }): Promise<ServiceResponse<{ sent: number; failed: number }>> {
    try {
      const response = await this.post<{ sent: number; failed: number }>('/broadcast', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService

