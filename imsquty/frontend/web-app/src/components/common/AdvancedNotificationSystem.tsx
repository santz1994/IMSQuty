import SuccessIcon from '@mui/icons-material/CheckCircle'
import ClearIcon from '@mui/icons-material/Clear'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'

export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  priority?: 'high' | 'medium' | 'low'
  duration?: number
}

interface AdvancedNotificationSystemProps {
  maxNotifications?: number
}

const AdvancedNotificationSystem: React.FC<AdvancedNotificationSystemProps> = ({
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Auto-remove notifications after duration
  useEffect(() => {
    const timers = notifications
      .filter((n) => n.duration)
      .map((notification) =>
        setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
      )

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [notifications])

  const addNotification = (
    notification: Omit<NotificationItem, 'id' | 'timestamp'>
  ) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      priority: notification.priority || 'medium',
      duration: notification.duration || 5000,
    }

    setNotifications((prev) => {
      const sorted = [...prev, newNotification].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return (
          (priorityOrder[a.priority || 'medium'] || 1) -
          (priorityOrder[b.priority || 'medium'] || 1)
        )
      })
      return sorted.slice(0, maxNotifications)
    })
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon sx={{ color: 'success.main' }} />
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />
      default:
        return <InfoIcon sx={{ color: 'info.main' }} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  // Expose notification system for global access
  React.useEffect(() => {
    ; (window as any).notificationSystem = {
      addNotification,
      removeNotification,
    }
  }, [addNotification, removeNotification])

  return (
    <>
      {/* Notification Container */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            sx={{
              animation: 'slideIn 0.3s ease-in-out',
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
            <CardContent sx={{ pb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ pt: 0.5 }}>{getIcon(notification.type)}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {notification.title}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => removeNotification(notification.id)}
                      sx={{ minWidth: 0, p: 0 }}
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    {notification.message}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {notification.priority && (
                      <Chip
                        label={notification.priority.toUpperCase()}
                        size="small"
                        color={getPriorityColor(notification.priority)}
                        variant="outlined"
                      />
                    )}
                    <Typography variant="caption" color="textSecondary">
                      {notification.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  )
}

export default AdvancedNotificationSystem
