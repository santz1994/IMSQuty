/**
 * Admin Dashboard Component
 * Role-specific dashboard for Admin users
 * 
 * Features:
 * - User management interface
 * - Module configuration
 * - System monitoring
 * - Support ticket handling
 */

import {
  Assignment,
  CheckCircle,
  MoreVert,
  Notifications,
  People,
  Refresh,
  Settings,
  Warning
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect } from 'react'
import { StatCard } from '../../components/dashboard/DashboardWidgets'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { useTickets } from '../../hooks/useTickets'
import { useUsers } from '../../hooks/useUsers'

const AdminDashboard: React.FC = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const { stats, loading: statsLoading, refreshStats } = useDashboard(true)
  const { users, loading: usersLoading } = useUsers(true, { per_page: 10 })
  const { tickets, loading: ticketsLoading } = useTickets(true, { perPage: 10 })

  // Check admin access
  const isAdmin = user?.role?.slug === 'admin'

  useEffect(() => {
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      refreshStats()
    }, 60000)

    return () => clearInterval(interval)
  }, [refreshStats])

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          🔒 Access Denied - Admin privileges required
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      p: 3,
      backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            💼 Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {(user as any)?.first_name || user?.username}! Here's your system overview
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refreshStats}
          disabled={statsLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            change={+5.2}
            icon={<People />}
            color="primary"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.users?.active || 0}
            change={+2.1}
            icon={<CheckCircle />}
            color="success"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Tickets"
            value={stats?.tickets?.open || 0}
            change={-3.5}
            icon={<Assignment />}
            color="warning"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={12}
            change={+8.1}
            icon={<Warning />}
            color="error"
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Users"
              action={
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {users.slice(0, 5).map((u, index) => (
                  <React.Fragment key={u.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary?.main || '#1976d2' }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${u.first_name} ${u.last_name}`}
                        secondary={u.email}
                      />
                      <Chip
                        label={u.status}
                        size="small"
                        color={u.status === 'active' ? 'success' : 'default'}
                      />
                    </ListItem>
                    {index < users.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Open Tickets */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Open Support Tickets"
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {tickets.slice(0, 5).map((ticket, index) => (
                  <React.Fragment key={ticket.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                          <Assignment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={ticket.title}
                        secondary={`Priority: ${ticket.priority} • Status: ${ticket.status}`}
                      />
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={
                          ticket.priority === 'high' ? 'error' :
                            ticket.priority === 'medium' ? 'warning' : 'default'
                        }
                      />
                    </ListItem>
                    {index < tickets.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="System Status" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">API Gateway</Typography>
                  <Chip label="Healthy" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Database</Typography>
                  <Chip label="Healthy" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Cache Server</Typography>
                  <Chip label="Healthy" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Queue Worker</Typography>
                  <Chip label="Running" size="small" color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Quick Actions" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<People />}
                    sx={{ py: 2 }}
                  >
                    Manage Users
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Settings />}
                    sx={{ py: 2 }}
                  >
                    System Settings
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assignment />}
                    sx={{ py: 2 }}
                  >
                    View Tickets
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Notifications />}
                    sx={{ py: 2 }}
                  >
                    Notifications
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
