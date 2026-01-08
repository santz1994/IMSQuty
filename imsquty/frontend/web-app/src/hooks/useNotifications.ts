/**
 * Notification Hook - Custom React hook for notification operations
 */
import { useCallback, useEffect, useState } from 'react'
import notificationService, { Notification } from '../services/NotificationService'

export const useNotifications = (autoFetch = false) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationService.getNotifications()
      if (response.success && response.data) {
        setNotifications(response.data)
        setUnreadCount(response.data.filter(n => !n.read).length)
      } else {
        setError(response.message || 'Failed to fetch notifications')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationService.markAsRead(id)
      if (response.success) {
        await fetchNotifications()
        return true
      } else {
        setError(response.message || 'Failed to mark as read')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        await fetchNotifications()
        return true
      } else {
        setError(response.message || 'Failed to mark all as read')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationService.deleteNotification(id)
      if (response.success) {
        await fetchNotifications()
        return true
      } else {
        setError(response.message || 'Failed to delete notification')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications])

  const deleteAllRead = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await notificationService.deleteAllRead()
      if (response.success) {
        await fetchNotifications()
        return true
      } else {
        setError(response.message || 'Failed to delete read notifications')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchNotifications])

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications()
    }
  }, [autoFetch, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  }
}
