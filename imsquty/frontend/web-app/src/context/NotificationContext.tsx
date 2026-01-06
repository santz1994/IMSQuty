import { Alert, Snackbar } from '@mui/material'
import React, { createContext, useCallback, useContext, useState } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type: NotificationType,
    duration?: number,
  ) => void
  hideNotification: (id: string) => void
}

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within NotificationProvider',
    )
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType,
      duration: number = 4000,
    ) => {
      const id = Date.now().toString()
      const notification: Notification = {
        id,
        message,
        type,
        duration,
      }

      console.log('[NOTIFICATION] 🔔 Showing:', { message, type, duration, id })
      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        setTimeout(() => {
          hideNotification(id)
        }, duration)
      }
    },
    [],
  )

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={notification.duration}
            onClose={() => hideNotification(notification.id)}
            sx={{ mb: 1 }}
          >
            <Alert
              onClose={() => hideNotification(notification.id)}
              severity={notification.type}
              sx={{ width: '100%', minWidth: 300 }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
