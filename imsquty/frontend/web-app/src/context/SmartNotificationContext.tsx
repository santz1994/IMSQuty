import { CheckCircle, Close, Error as ErrorIcon, Info, Warning } from '@mui/icons-material'
import { Alert, Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material'
import React, { useCallback, useState } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical'

export interface SmartNotification {
  id: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  timestamp?: number
}

interface SmartNotificationContextType {
  notifications: SmartNotification[]
  showNotification: (
    message: string,
    type?: NotificationType,
    duration?: number,
    priority?: NotificationPriority,
    action?: { label: string; onClick: () => void },
  ) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
}

const SmartNotificationContext = React.createContext<SmartNotificationContextType | undefined>(
  undefined,
)

const getIconForType = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle />,
    error: <ErrorIcon />,
    warning: <Warning />,
    info: <Info />,
  }
  return icons[type]
}

const getDurationByPriority = (priority: NotificationPriority, customDuration?: number) => {
  if (customDuration) return customDuration
  const durations: Record<NotificationPriority, number> = {
    low: 3000,
    normal: 4000,
    high: 5000,
    critical: 0, // Won't auto-dismiss
  }
  return durations[priority]
}

/**
 * Smart Notification Provider
 * Features:
 * - Priority-based queue management
 * - Auto-dismiss with customizable duration
 * - Stacking with smooth animations
 * - Action buttons
 * - Persistent critical notifications
 */
export const SmartNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      duration?: number,
      priority: NotificationPriority = 'normal',
      action?: { label: string; onClick: () => void },
    ) => {
      const id = `${Date.now()}-${Math.random()}`
      const finalDuration = getDurationByPriority(priority, duration)

      const newNotification: SmartNotification = {
        id,
        message,
        type,
        priority,
        duration: finalDuration,
        action,
        dismissible: priority !== 'critical',
        timestamp: Date.now(),
      }

      setNotifications((prev) => {
        // Sort by priority: critical > high > normal > low
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 }
        const updated = [...prev, newNotification]
        return updated.sort(
          (a, b) =>
            (priorityOrder[a.priority || 'normal'] || 2) -
            (priorityOrder[b.priority || 'normal'] || 2),
        )
      })

      // Auto-dismiss if duration > 0
      if (finalDuration > 0) {
        const timer = setTimeout(() => {
          dismissNotification(id)
        }, finalDuration)

        return () => clearTimeout(timer)
      }
    },
    [],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: SmartNotificationContextType = {
    notifications,
    showNotification,
    dismissNotification,
    clearAll,
  }

  return (
    <SmartNotificationContext.Provider value={value}>
      {children}
      <SmartNotificationDisplay notifications={notifications} onDismiss={dismissNotification} />
    </SmartNotificationContext.Provider>
  )
}

/**
 * Display component for notifications
 * Shows up to 3 notifications at a time, stacked vertically
 */
const SmartNotificationDisplay: React.FC<{
  notifications: SmartNotification[]
  onDismiss: (id: string) => void
}> = ({ notifications, onDismiss }) => {
  const visibleNotifications = notifications.slice(0, 3)

  return (
    <Stack
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        gap: 1,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      {visibleNotifications.map((notification, index) => (
        <Collapse key={notification.id} in={true} timeout={300}>
          <Alert
            icon={getIconForType(notification.type)}
            severity={notification.type}
            action={
              notification.action || notification.dismissible ? (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {notification.action && (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        notification.action?.onClick()
                        onDismiss(notification.id)
                      }}
                      sx={{ fontWeight: 600 }}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                  {notification.dismissible && (
                    <IconButton
                      size="small"
                      onClick={() => onDismiss(notification.id)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ) : undefined
            }
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: 1,
              animation: `slideIn 0.3s ease-out`,
              '@keyframes slideIn': {
                from: {
                  transform: 'translateX(400px)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateX(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {notification.message}
              </Typography>
              {notification.priority === 'critical' && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Critical Alert - Requires Attention
                </Typography>
              )}
            </Box>
          </Alert>
        </Collapse>
      ))}

      {notifications.length > 3 && (
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mt: 1,
          }}
        >
          +{notifications.length - 3} more notification{notifications.length - 4 > 0 ? 's' : ''}
        </Typography>
      )}
    </Stack>
  )
}

export const useSmartNotification = () => {
  const context = React.useContext(SmartNotificationContext)
  if (!context) {
    throw new Error('useSmartNotification must be used within SmartNotificationProvider')
  }
  return context
}

export default SmartNotificationContext
