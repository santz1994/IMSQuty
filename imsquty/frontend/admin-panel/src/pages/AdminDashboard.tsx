import { Article, Lock, People, TrendingUp } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUsers } from '../store/slices/userSlice'

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 100 }))
  }, [dispatch])

  // Generate user growth data (last 7 days)
  const userGrowthData = useMemo(() => {
    const today = new Date()
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      
      // Count users created on this day (mock data - in production use real created_at)
      const count = Math.floor(Math.random() * 10) + 5
      data.push({
        date: dateStr,
        users: count,
      })
    }
    return data
  }, [])

  // Role distribution data
  const roleDistributionData = useMemo(() => {
    const roleCounts: Record<string, number> = {}
    users.forEach((user) => {
      const role = user.role_name || 'Unknown'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })
    
    return Object.entries(roleCounts).map(([name, value]) => ({
      name,
      value,
    }))
  }, [users])

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Recent activity feed (mock data - in production use real audit logs)
  const recentActivity = useMemo(() => [
    { id: 1, action: 'User created', user: 'Admin', time: '5 minutes ago' },
    { id: 2, action: 'Role updated', user: 'Superadmin', time: '15 minutes ago' },
    { id: 3, action: 'Settings changed', user: 'Admin', time: '1 hour ago' },
    { id: 4, action: 'User deleted', user: 'Superadmin', time: '2 hours ago' },
    { id: 5, action: 'Permissions modified', user: 'Admin', time: '3 hours ago' },
  ], [])

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: People,
      color: '#1976d2',
    },
    {
      label: 'Active Users',
      value: users.filter((u) => u.is_active).length,
      icon: People,
      color: '#4caf50',
    },
    {
      label: 'System Roles',
      value: roleDistributionData.length,
      icon: Lock,
      color: '#ff9800',
    },
    {
      label: 'Recent Logs',
      value: recentActivity.length,
      icon: Article,
      color: '#f44336',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            {stat.label}
                          </Typography>
                          <Typography variant="h5">
                            {stat.value}
                          </Typography>
                        </Box>
                        <Icon sx={{ fontSize: 40, color: stat.color, opacity: 0.5 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* User Growth Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="User Growth (Last 7 Days)"
                  avatar={<TrendingUp color="primary" />}
                />
                <Divider />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#1976d2"
                        strokeWidth={2}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Role Distribution Chart */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Role Distribution" />
                <Divider />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bottom Row */}
          <Grid container spacing={3}>
            {/* Quick Statistics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quick Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Users Created This Month
                    </Typography>
                    <Typography variant="h6">
                      {userGrowthData.reduce((sum, item) => sum + item.users, 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      System Health
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      98%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Backup
                    </Typography>
                    <Typography variant="h6">
                      2 hours ago
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Activity Feed */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Recent Activity" />
                <Divider />
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemText
                        primary={activity.action}
                        secondary={`${activity.user} • ${activity.time}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default AdminDashboard
