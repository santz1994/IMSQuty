import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GroupIcon from '@mui/icons-material/Group'
import PendingIcon from '@mui/icons-material/Pending'
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
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
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
 * Manager Dashboard
 * 
 * Focus: Team operations & project oversight
 * 
 * Features:
 * - Team performance monitoring
 * - Task allocation & tracking
 * - Approval workflow management
 * - Department KPIs
 * - Resource request handling
 * - Staff performance reviews
 */
const ManagerDashboard: React.FC = () => {
  const theme = useTheme()
  const { isManager } = useRole()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabIndex, setTabIndex] = useState(0)
  const [teamMetrics, setTeamMetrics] = useState<any>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])

  useEffect(() => {
    if (isManager) {
      fetchManagerMetrics()
    }
  }, [isManager])

  const fetchManagerMetrics = async () => {
    try {
      setLoading(true)
      const [metrics, approvals] = await Promise.all([
        dashboardService.getTeamMetrics(),
        dashboardService.getPendingApprovals()
      ])

      setTeamMetrics(metrics)
      setPendingApprovals(approvals)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!isManager) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Akses terbatas untuk Manager saja</Typography>
      </Box>
    )
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading Manager Dashboard...</Box>
  }

  // Real data from API (fetched via dashboardService.getTeamMetrics)
  const teamStats = teamMetrics?.stats || [
    {
      title: 'Team Members',
      value: teamMetrics?.teamMembers || '0',
      subtitle: 'Active team size',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: '#2563eb'
    },
    {
      title: 'Active Projects',
      value: teamMetrics?.activeProjects || '0',
      subtitle: 'In progress',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6'
    },
    {
      title: 'Completed Tasks',
      value: teamMetrics?.completedTasks || '0',
      subtitle: 'This month',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#10b981'
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals?.length || '0',
      subtitle: 'Requires action',
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b'
    }
  ]

  const teamPerformance = teamMetrics?.teamPerformance || []
  const projectStatus = teamMetrics?.projects || []
  const approvalsList = pendingApprovals || []

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: 700 }}>
            👨‍💼 Manager Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            Team Operations & Project Oversight
          </Typography>
        </Box>
        <Chip
          label="LEADERSHIP ACCESS"
          sx={{
            backgroundColor: '#2563eb',
            color: '#fff',
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
        {teamStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
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
        {/* Team Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#2563eb', mb: 2, fontWeight: 600 }}>
              📊 Team Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Total Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 600 }}>
                ⏳ Pending Approvals
              </Typography>
              <Chip label={approvalsList.length} color="warning" size="small" />
            </Stack>
            <List sx={{ maxHeight: 280, overflow: 'auto' }}>
              {approvalsList.map((approval, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    borderBottom: idx < approvalsList.length - 1 ? '1px solid #e5e7eb' : 'none',
                    px: 0
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {approval.type}
                        </Typography>
                        <Chip
                          label={approval.priority}
                          size="small"
                          color={
                            approval.priority === 'High' ? 'error' :
                              approval.priority === 'Medium' ? 'warning' : 'default'
                          }
                          sx={{ height: '18px', fontSize: '0.7rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {approval.requester} • {approval.date}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#2563eb' }}
            >
              View All Approvals
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Project Status */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#2563eb', mb: 2, fontWeight: 600 }}>
              🎯 Active Projects Status
            </Typography>
            <Grid container spacing={2}>
              {projectStatus.map((project, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ backgroundColor: '#f9fafb' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {project.name}
                        </Typography>
                        <Chip
                          label={project.status}
                          size="small"
                          color={
                            project.status === 'On Track' ? 'success' :
                              project.status === 'Ahead' ? 'info' : 'error'
                          }
                        />
                        <Box>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption">Progress</Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {project.progress}%
                            </Typography>
                          </Stack>
                          <Box sx={{
                            width: '100%',
                            height: 6,
                            backgroundColor: '#e5e7eb',
                            borderRadius: 1
                          }}>
                            <Box sx={{
                              width: `${project.progress}%`,
                              height: '100%',
                              backgroundColor:
                                project.status === 'On Track' ? '#10b981' :
                                  project.status === 'Ahead' ? '#3b82f6' : '#ef4444',
                              borderRadius: 1,
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          👥 {project.team} team members
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ManagerDashboard
