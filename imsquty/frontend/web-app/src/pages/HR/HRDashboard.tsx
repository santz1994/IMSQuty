import AssessmentIcon from '@mui/icons-material/Assessment'
import EventIcon from '@mui/icons-material/Event'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import {
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { dashboardService } from '../../api/dashboardService'
import { useRole } from '../../context/RoleContext'
const theme = { palette: { background: { default: '#f5f5f5' }, primary: { main: '#1976d2', contrastText: '#fff' }, text: { secondary: '#666', primary: '#000' } } }

/**
 * HR (Human Resources) Dashboard
 * 
 * Focus: Employee management & HR operations
 * 
 * Features:
 * - Employee data overview
 * - Recruitment pipeline
 * - Leave & attendance management
 * - Training & development tracking
 * - Employee relations metrics
 * - Access control by position
 */
const HRDashboard: React.FC = () => {
  const { isHR } = useRole()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hrMetrics, setHRMetrics] = useState<any>(null)

  useEffect(() => {
    if (isHR) {
      fetchHRMetrics()
    }
  }, [isHR])

  const fetchHRMetrics = async () => {
    try {
      setLoading(true)
      const metrics = await dashboardService.getHRMetrics()
      setHRMetrics(metrics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch HR metrics')
    } finally {
      setLoading(false)
    }
  }

  if (!isHR) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Akses terbatas untuk HR saja</Typography>
      </Box>
    )
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading HR Dashboard...</Box>
  }

  // Real data from API (with fallback for demo)
  const hrStats = hrMetrics?.stats || [
    {
      title: 'Total Employees',
      value: hrMetrics?.totalEmployees || '0',
      subtitle: 'From User Service API',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6'
    },
    {
      title: 'Open Positions',
      value: hrMetrics?.openPositions || '0',
      subtitle: 'Awaiting candidates',
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6'
    },
    {
      title: 'Pending Leaves',
      value: hrMetrics?.pendingLeaves || '0',
      subtitle: 'Requires approval',
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b'
    },
    {
      title: 'Training Sessions',
      value: hrMetrics?.trainingSessions || '0',
      subtitle: 'Scheduled this month',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#10b981'
    }
  ]

  const departmentDistribution = hrMetrics?.departmentDistribution || []
  const recruitmentPipeline = hrMetrics?.recruitmentPipeline || []
  const leaveRequests = hrMetrics?.leaveRequests || []
  const upcomingTrainings = hrMetrics?.upcomingTrainings || []

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: theme.palette.primary?.main || '#1976d2', fontWeight: 700 }}>
            HR Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Human Resources Management & Employee Operations
          </Typography>
        </Box>
        <Chip
          label="HR ACCESS"
          sx={{
            backgroundColor: theme.palette.primary?.main || '#1976d2',
            color: theme.palette.primary?.contrastText || '#fff',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}
        />
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} mb={3}>
        {hrStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
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
        {/* Department Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>
              🏢 Employee Distribution by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recruitment Pipeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>
              📊 Recruitment Pipeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recruitmentPipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Leave Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                📅 Pending Leave Requests
              </Typography>
              <Chip label={leaveRequests.filter(l => l.status === 'Pending').length} color="warning" size="small" />
            </Stack>
            <List>
              {leaveRequests.map((leave, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderBottom: idx < leaveRequests.length - 1 ? '1px solid #e5e7eb' : 'none',
                    px: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {leave.employee}
                        </Typography>
                        <Chip
                          label={leave.status}
                          size="small"
                          color={leave.status === 'Pending' ? 'warning' : 'success'}
                          sx={{ height: '18px', fontSize: '0.7rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {leave.type} • {leave.days} days
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#8b5cf6' }}
            >
              Review All Requests
            </Button>
          </Paper>
        </Grid>

        {/* Upcoming Trainings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>
              📚 Upcoming Training Sessions
            </Typography>
            <List>
              {upcomingTrainings.map((training, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderBottom: idx < upcomingTrainings.length - 1 ? '1px solid #e5e7eb' : 'none',
                    px: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {training.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {training.date} • {training.participants} participants
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, borderColor: '#8b5cf6', color: '#8b5cf6' }}
            >
              Manage Training Calendar
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HRDashboard
