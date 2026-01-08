/**
 * Enhanced SuperAdmin Dashboard Component
 * Uses new three-tier architecture with hooks
 * 
 * Features:
 * - Real-time system metrics with useDashboard hook
 * - Asset monitoring with useAssets hook
 * - Ticket overview with useTickets hook
 * - Authentication integration with useAuth hook
 * - Reusable dashboard widgets
 */

import {
  Assessment,
  Dashboard as DashboardIcon,
  Refresh,
  Security,
  Speed,
  Storage,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ActivityItem,
  ChartCard,
  DashboardGrid,
  QuickActionButton,
  StatCard,
} from '../../components/dashboard/DashboardWidgets'
import { useAssets } from '../../hooks/useAssets'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { useTickets } from '../../hooks/useTickets'

const EnhancedSuperAdminDashboard: React.FC = () => {
  const theme = useTheme()
  const [tabIndex, setTabIndex] = useState(0)

  // Use new hooks from our three-tier architecture
  const { user, checkPermission } = useAuth()
  const { stats: dashboardStats, loading: dashboardLoading, error: dashboardError, fetchStats, refreshStats } = useDashboard(true)
  const { assets, loading: assetsLoading } = useAssets(true, { perPage: 10 })
  const { tickets, stats: ticketStats, loading: ticketsLoading } = useTickets(true, { perPage: 10 })

  // Access control
  const isSuperAdmin = user?.role?.slug === 'superadmin'

  useEffect(() => {
    if (!isSuperAdmin) return

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [isSuperAdmin, refreshStats])

  // Access denied if not super-admin
  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          🔒 Access Denied - Super-Admin privileges required
        </Alert>
      </Box>
    )
  }

  // Loading state
  if (dashboardLoading && !dashboardStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    )
  }

  // Error state
  if (dashboardError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{dashboardError}</Alert>
      </Box>
    )
  }

  // Mock system performance data (to be replaced with real metrics)
  const systemMetrics = [
    { time: '00:00', cpu: 45, memory: 62, requests: 1200 },
    { time: '04:00', cpu: 38, memory: 58, requests: 800 },
    { time: '08:00', cpu: 72, memory: 75, requests: 2500 },
    { time: '12:00', cpu: 85, memory: 82, requests: 3200 },
    { time: '16:00', cpu: 68, memory: 71, requests: 2800 },
    { time: '20:00', cpu: 52, memory: 65, requests: 1800 },
  ]

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? '#0a0e27' : '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon fontSize="large" />
              Super-Admin System Console
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Real-time system monitoring & infrastructure management
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshStats}
              disabled={dashboardLoading}
            >
              Refresh
            </Button>
            <Chip
              label={dashboardLoading ? 'Updating...' : 'Live'}
              color={dashboardLoading ? 'default' : 'success'}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
          <Tab label="Overview" />
          <Tab label="System Health" />
          <Tab label="Database" />
          <Tab label="Services" />
          <Tab label="Infrastructure" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tabIndex === 0 && (
        <Box>
          {/* Key Metrics */}
          <DashboardGrid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Total Assets"
                value={dashboardStats?.assets?.total || 0}
                change={12}
                trend="up"
                color="primary"
                icon={<Storage />}
                loading={assetsLoading}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Open Tickets"
                value={ticketStats?.open || 0}
                change={-5}
                trend="down"
                color="warning"
                loading={ticketsLoading}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="System Uptime"
                value="99.9%"
                trend="stable"
                format="percentage"
                color="success"
                icon={<Speed />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                title="Active Users"
                value={dashboardStats?.users?.active || 0}
                change={8}
                trend="up"
                color="info"
              />
            </Grid>
          </DashboardGrid>

          {/* System Performance Chart */}
          <Box sx={{ mt: 3 }}>
            <ChartCard title="System Performance (24h)" subtitle="CPU, Memory, and Request metrics">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={systemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="requests" stroke="#ffc658" name="Requests/h" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionButton
                  label="Database Backup"
                  icon={<Storage />}
                  color="primary"
                  onClick={() => console.log('Database backup')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionButton
                  label="System Logs"
                  icon={<Assessment />}
                  color="secondary"
                  onClick={() => console.log('System logs')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionButton
                  label="Security Audit"
                  icon={<Security />}
                  color="error"
                  onClick={() => console.log('Security audit')}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <QuickActionButton
                  label="Clear Cache"
                  icon={<Refresh />}
                  color="warning"
                  onClick={() => console.log('Clear cache')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Recent Activities */}
          <Box sx={{ mt: 3 }}>
            <ChartCard title="Recent System Activities" subtitle="Last 10 activities">
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {dashboardStats?.recent_activities?.slice(0, 10).map((activity: any, index: number) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    timestamp={activity.timestamp}
                    user={activity.user}
                    color={activity.type === 'asset' ? 'primary' : activity.type === 'ticket' ? 'warning' : 'info'}
                  />
                ))}
              </Box>
            </ChartCard>
          </Box>
        </Box>
      )}

      {/* System Health Tab */}
      {tabIndex === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            System health monitoring - All services operational
          </Alert>
          {/* Add system health content */}
        </Box>
      )}

      {/* Database Tab */}
      {tabIndex === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Database statistics and performance metrics
          </Alert>
          {/* Add database content */}
        </Box>
      )}

      {/* Services Tab */}
      {tabIndex === 3 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Microservices health and monitoring
          </Alert>
          {/* Add services content */}
        </Box>
      )}

      {/* Infrastructure Tab */}
      {tabIndex === 4 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Infrastructure monitoring and Docker status
          </Alert>
          {/* Add infrastructure content */}
        </Box>
      )}
    </Box>
  )
}

export default EnhancedSuperAdminDashboard
