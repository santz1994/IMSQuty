import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { dashboardService } from '../../api/dashboardService'
import { useRole } from '../../context/RoleContext'

/**
 * User (Employee) Dashboard
 * 
 * Focus: Daily operational tasks & personal workspace
 * 
 * Features:
 * - Personal task overview
 * - Ticket submission & tracking
 * - Meeting room bookings
 * - Asset assignments view
 * - Personal notifications
 * - Quick actions
 */
const UserDashboard: React.FC = () => {
  const { user } = useRole()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userMetrics, setUserMetrics] = useState<any>(null)

  useEffect(() => {
    fetchUserMetrics()
  }, [])

  const fetchUserMetrics = async () => {
    try {
      setLoading(true)
      const metrics = await dashboardService.getUserMetrics()
      setUserMetrics(metrics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading Dashboard...</Box>
  }

  // Real data from API (fetched via dashboardService user methods)
  const personalStats = userMetrics?.stats || [
    {
      title: 'My Tasks',
      value: userMetrics?.tasks?.length || '0',
      subtitle: userMetrics?.tasksDueToday ? `${userMetrics.tasksDueToday} due today` : 'No tasks',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6'
    },
    {
      title: 'Completed',
      value: userMetrics?.completedTasks || '0',
      subtitle: 'This month',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#10b981'
    },
    {
      title: 'My Bookings',
      value: userMetrics?.myBookings || '0',
      subtitle: userMetrics?.upcomingBookings ? `${userMetrics.upcomingBookings} upcoming` : 'No bookings',
      icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6'
    },
    {
      title: 'Notifications',
      value: userMetrics?.notifications || '0',
      subtitle: userMetrics?.unreadNotifications ? `${userMetrics.unreadNotifications} unread` : 'All read',
      icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b'
    }
  ]

  const myTasks = userMetrics?.tasks || []
  const myAssets = userMetrics?.assets || []
  const recentActivity = userMetrics?.recentActivity || []
  const activityTrend = userMetrics?.activityTrend || []

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header with User Info */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: '#1f2937', fontWeight: 700 }}>
            Welcome back, {user?.name || 'User'}! 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            Here's what's happening with your work today
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label="EMPLOYEE"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          />
          <Avatar sx={{ width: 48, height: 48, backgroundColor: '#3b82f6' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </Stack>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} mb={3}>
        {personalStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 }, cursor: 'pointer' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3} mb={3}>
        {/* My Tasks */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                📋 My Tasks
              </Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Stack>
            <Stack spacing={2}>
              {myTasks.map((task, idx) => (
                <Card key={idx} sx={{ backgroundColor: '#f9fafb' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {task.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={task.status}
                            size="small"
                            color={task.status === 'In Progress' ? 'primary' : 'default'}
                            sx={{ height: '20px', fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={`Due: ${task.dueDate}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: '20px', fontSize: '0.75rem' }}
                          />
                        </Stack>
                      </Box>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={
                          task.priority === 'High' ? 'error' :
                            task.priority === 'Medium' ? 'warning' : 'default'
                        }
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#3b82f6' }}
            >
              Create New Task
            </Button>
          </Paper>
        </Grid>

        {/* Activity Trend */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', mb: 2, fontWeight: 600 }}>
              📊 This Week's Activity
            </Typography>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', mb: 2, fontWeight: 600 }}>
              ⚡ Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Button variant="outlined" fullWidth>
                📝 Create Ticket
              </Button>
              <Button variant="outlined" fullWidth>
                🏢 Book Meeting Room
              </Button>
              <Button variant="outlined" fullWidth>
                📄 Submit Report
              </Button>
              <Button variant="outlined" fullWidth>
                📋 Request Asset
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* My Assets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', mb: 2, fontWeight: 600 }}>
              💼 My Assigned Assets
            </Typography>
            <List>
              {myAssets.map((asset, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderBottom: idx < myAssets.length - 1 ? '1px solid #e5e7eb' : 'none',
                    px: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {asset.name}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          ID: {asset.id}
                        </Typography>
                        <Chip
                          label={asset.status}
                          size="small"
                          color="success"
                          sx={{ height: '16px', fontSize: '0.65rem' }}
                        />
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', mb: 2, fontWeight: 600 }}>
              🕒 Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid #e5e7eb' : 'none',
                    px: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {activity.action}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {activity.time}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserDashboard
