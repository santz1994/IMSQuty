/**
 * Enhanced Dashboard Widget Components
 * Reusable dashboard widgets for all RBAC roles
 */

import {
    Remove,
    TrendingDown,
    TrendingUp
} from '@mui/icons-material'
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Typography,
    useTheme
} from '@mui/material'
import React from 'react'

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'currency' | 'percentage'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  icon?: React.ReactNode
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend = 'stable',
  format = 'number',
  color = 'primary',
  icon,
  loading = false,
}) => {
  const theme = useTheme()

  const formatValue = () => {
    if (typeof value === 'number') {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(value)
        case 'percentage':
          return `${value.toFixed(1)}%`
        default:
          return new Intl.NumberFormat('id-ID').format(value)
      }
    }
    return value
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" color="success" />
      case 'down':
        return <TrendingDown fontSize="small" color="error" />
      default:
        return <Remove fontSize="small" color="disabled" />
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && <Box sx={{ color: `${color}.main` }}>{icon}</Box>}
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <Typography variant="h4" sx={{ mb: 1, color: `${color}.main` }}>
              {formatValue()}
            </Typography>

            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrendIcon()}
                <Typography
                  variant="body2"
                  color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                >
                  {change > 0 ? '+' : ''}
                  {change}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs last period
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: string
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  loading = false,
  error,
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>

        {loading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  label: string
  icon: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  onClick: () => void
  disabled?: boolean
}

export const QuickActionButton: React.FC<QuickActionProps> = ({
  label,
  icon,
  color = 'primary',
  onClick,
  disabled = false,
}) => {
  return (
    <Card
      sx={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': !disabled && {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 1, color: `${color}.main` }}>{icon}</Box>
        <Typography variant="body2">{label}</Typography>
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  type: string
  title: string
  description: string
  timestamp: string
  user?: string
  color?: string
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  description,
  timestamp,
  user,
  color = 'primary',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: `${color}.light`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color={`${color}.main`} fontWeight="bold">
          {type[0].toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          {user && (
            <Chip label={user} size="small" variant="outlined" />
          )}
          <Typography variant="caption" color="text.secondary">
            {formatDateTimeID(timestamp)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

interface DashboardGridProps {
  children: React.ReactNode
  spacing?: number
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, spacing = 3 }) => {
  return (
    <Grid container spacing={spacing}>
      {children}
    </Grid>
  )
}

interface MetricRowProps {
  label: string
  value: string | number
  total?: string | number
  percentage?: number
  color?: string
}

export const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  total,
  percentage,
  color = 'primary',
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="medium">
          {value}
          {total && ` / ${total}`}
        </Typography>
      </Box>
      {percentage !== undefined && (
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: `${color}.main`,
            },
          }}
        />
      )}
    </Box>
  )
}

export default {
  StatCard,
  ChartCard,
  QuickActionButton,
  ActivityItem,
  DashboardGrid,
  MetricRow,
}
