import {
  Add,
  Delete,
  Edit,
  FilterList,
  PlayArrow,
  Refresh,
  Stop
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../../store/hooks'

// Types
interface Activity {
  id: number
  title: string
  description: string
  category: 'maintenance' | 'support' | 'installation' | 'training' | 'documentation' | 'other'
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to: string
  created_by: string
  start_time: string | null
  end_time: string | null
  duration_minutes: number
  notes: string
  created_at: string
  updated_at: string
}

interface ActivityStats {
  total: number
  completed: number
  in_progress: number
  pending: number
  total_hours: number
  avg_completion_time: number
}

// Category colors
const categoryColors: Record<Activity['category'], string> = {
  maintenance: '#2196f3',
  support: '#ff9800',
  installation: '#4caf50',
  training: '#9c27b0',
  documentation: '#00bcd4',
  other: '#607d8b',
}

// Priority colors
const priorityColors: Record<Activity['priority'], 'default' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  critical: 'error',
}

const DailyActivities: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    completed: 0,
    in_progress: 0,
    pending: 0,
    total_hours: 0,
    avg_completion_time: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'support' as Activity['category'],
    priority: 'medium' as Activity['priority'],
    notes: '',
  })

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    date: new Date().toISOString().split('T')[0],
    assigned_to: 'all',
  })

  // Mock data for development
  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [activities, filters])

  const loadActivities = () => {
    setLoading(true)

    // Mock data - Replace with API call
    const mockActivities: Activity[] = [
      {
        id: 1,
        title: 'Replace broken monitor',
        description: 'Monitor in room 301 not turning on',
        category: 'maintenance',
        status: 'completed',
        priority: 'high',
        assigned_to: user?.email || 'user@example.com',
        created_by: 'receptionist@quty.co.id',
        start_time: '2026-01-14T08:30:00',
        end_time: '2026-01-14T09:15:00',
        duration_minutes: 45,
        notes: 'Replaced with spare from storage',
        created_at: '2026-01-14T08:00:00',
        updated_at: '2026-01-14T09:15:00',
      },
      {
        id: 2,
        title: 'Setup new employee workstation',
        description: 'Configure computer for new hire in Finance',
        category: 'installation',
        status: 'in-progress',
        priority: 'medium',
        assigned_to: user?.email || 'user@example.com',
        created_by: 'hr@quty.co.id',
        start_time: '2026-01-14T10:00:00',
        end_time: null,
        duration_minutes: 0,
        notes: 'Installing Office 365 and internal apps',
        created_at: '2026-01-14T09:00:00',
        updated_at: '2026-01-14T10:00:00',
      },
      {
        id: 3,
        title: 'Network connectivity issue',
        description: 'WiFi not working in meeting room B',
        category: 'support',
        status: 'pending',
        priority: 'critical',
        assigned_to: user?.email || 'user@example.com',
        created_by: 'manager@quty.co.id',
        start_time: null,
        end_time: null,
        duration_minutes: 0,
        notes: '',
        created_at: '2026-01-14T10:30:00',
        updated_at: '2026-01-14T10:30:00',
      },
      {
        id: 4,
        title: 'Update system documentation',
        description: 'Document new asset management procedures',
        category: 'documentation',
        status: 'pending',
        priority: 'low',
        assigned_to: user?.email || 'user@example.com',
        created_by: 'admin@quty.co.id',
        start_time: null,
        end_time: null,
        duration_minutes: 0,
        notes: '',
        created_at: '2026-01-14T11:00:00',
        updated_at: '2026-01-14T11:00:00',
      },
    ]

    setActivities(mockActivities)
    calculateStats(mockActivities)
    setLoading(false)
  }

  const calculateStats = (data: Activity[]) => {
    const total = data.length
    const completed = data.filter((a) => a.status === 'completed').length
    const in_progress = data.filter((a) => a.status === 'in-progress').length
    const pending = data.filter((a) => a.status === 'pending').length
    const total_minutes = data.reduce((sum, a) => sum + a.duration_minutes, 0)
    const total_hours = Math.round((total_minutes / 60) * 10) / 10
    const avg_completion_time = completed > 0
      ? Math.round((data.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.duration_minutes, 0) / completed))
      : 0

    setStats({
      total,
      completed,
      in_progress,
      pending,
      total_hours,
      avg_completion_time,
    })
  }

  const applyFilters = () => {
    let filtered = [...activities]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((a) => a.status === filters.status)
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter((a) => a.category === filters.category)
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter((a) => a.priority === filters.priority)
    }

    // Filter by date
    if (filters.date) {
      filtered = filtered.filter((a) => a.created_at.startsWith(filters.date))
    }

    setFilteredActivities(filtered)
  }

  const handleAddActivity = () => {
    setLoading(true)

    // Mock API call - Replace with actual API
    const newActivity: Activity = {
      id: activities.length + 1,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: 'pending',
      priority: formData.priority,
      assigned_to: user?.email || 'user@example.com',
      created_by: user?.email || 'user@example.com',
      start_time: null,
      end_time: null,
      duration_minutes: 0,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setActivities([newActivity, ...activities])
    setSuccess('Activity added successfully!')
    setOpenAddDialog(false)
    resetForm()
    setLoading(false)

    setTimeout(() => setSuccess(null), 3000)
  }

  const handleStartActivity = (activity: Activity) => {
    setLoading(true)

    const updated = activities.map((a) =>
      a.id === activity.id
        ? { ...a, status: 'in-progress' as const, start_time: new Date().toISOString() }
        : a
    )

    setActivities(updated)
    setSuccess('Activity started!')
    setLoading(false)

    setTimeout(() => setSuccess(null), 3000)
  }

  const handleStopActivity = (activity: Activity) => {
    setLoading(true)

    const start = new Date(activity.start_time!)
    const end = new Date()
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60)

    const updated = activities.map((a) =>
      a.id === activity.id
        ? {
          ...a,
          status: 'completed' as const,
          end_time: end.toISOString(),
          duration_minutes: duration,
        }
        : a
    )

    setActivities(updated)
    calculateStats(updated)
    setSuccess('Activity completed!')
    setLoading(false)

    setTimeout(() => setSuccess(null), 3000)
  }

  const handleDeleteActivity = (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    setLoading(true)
    const updated = activities.filter((a) => a.id !== id)
    setActivities(updated)
    calculateStats(updated)
    setSuccess('Activity deleted!')
    setLoading(false)

    setTimeout(() => setSuccess(null), 3000)
  }

  const handleEditActivity = () => {
    if (!selectedActivity) return

    setLoading(true)

    const updated = activities.map((a) =>
      a.id === selectedActivity.id
        ? {
          ...a,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        }
        : a
    )

    setActivities(updated)
    setSuccess('Activity updated!')
    setOpenEditDialog(false)
    setSelectedActivity(null)
    resetForm()
    setLoading(false)

    setTimeout(() => setSuccess(null), 3000)
  }

  const openEdit = (activity: Activity) => {
    setSelectedActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      priority: activity.priority,
      notes: activity.notes,
    })
    setOpenEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'support',
      priority: 'medium',
      notes: '',
    })
  }

  const resetFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      priority: 'all',
      date: new Date().toISOString().split('T')[0],
      assigned_to: 'all',
    })
  }

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Daily Activities - IT Support</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setOpenFilterDialog(true)}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadActivities}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Activity
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

        {/* Statistics Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Activities</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
              <CardContent>
                <Typography gutterBottom>Completed</Typography>
                <Typography variant="h4">{stats.completed}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
              <CardContent>
                <Typography gutterBottom>In Progress</Typography>
                <Typography variant="h4">{stats.in_progress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
              <CardContent>
                <Typography gutterBottom>Pending</Typography>
                <Typography variant="h4">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Hours</Typography>
                <Typography variant="h4">{stats.total_hours}h</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Avg. Completion</Typography>
                <Typography variant="h4">{formatDuration(stats.avg_completion_time)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activities Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No activities found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.category}
                          size="small"
                          sx={{
                            bgcolor: categoryColors[activity.category],
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.priority}
                          size="small"
                          color={priorityColors[activity.priority]}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          size="small"
                          color={
                            activity.status === 'completed'
                              ? 'success'
                              : activity.status === 'in-progress'
                                ? 'warning'
                                : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{formatTime(activity.start_time)}</TableCell>
                      <TableCell>{formatDuration(activity.duration_minutes)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {activity.status === 'pending' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStartActivity(activity)}
                              title="Start"
                            >
                              <PlayArrow />
                            </IconButton>
                          )}
                          {activity.status === 'in-progress' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStopActivity(activity)}
                              title="Complete"
                            >
                              <Stop />
                            </IconButton>
                          )}
                          {activity.status === 'pending' && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEdit(activity)}
                              title="Edit"
                            >
                              <Edit />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteActivity(activity.id)}
                            title="Delete"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add Activity Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Activity['category'] })}
                >
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="installation">Installation</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Activity['priority'] })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddActivity}
              variant="contained"
              disabled={!formData.title || !formData.description}
            >
              Add Activity
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Activity Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Activity['category'] })}
                >
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="installation">Installation</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Activity['priority'] })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleEditActivity}
              variant="contained"
              disabled={!formData.title || !formData.description}
            >
              Update Activity
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Activities</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                  <MenuItem value="installation">Installation</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetFilters}>Reset</Button>
            <Button onClick={() => setOpenFilterDialog(false)} variant="contained">
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default DailyActivities
