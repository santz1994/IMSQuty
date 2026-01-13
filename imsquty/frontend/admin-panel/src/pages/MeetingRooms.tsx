import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MeetingRoom as MeetingRoomIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
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
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface MeetingRoom {
  id: number
  name: string
  location: string
  floor: string
  capacity: number
  facilities: string[]
  status: 'available' | 'unavailable' | 'maintenance'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FormData {
  name: string
  location: string
  floor: string
  capacity: number | ''
  facilities: string
  status: 'available' | 'unavailable' | 'maintenance'
  is_active: boolean
}

interface ValidationErrors {
  name?: string
  location?: string
  floor?: string
  capacity?: string
  facilities?: string
}

const MeetingRooms: React.FC = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    floor: '',
    capacity: '',
    facilities: '',
    status: 'available',
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<ValidationErrors>({})

  // Fetch meeting rooms
  const fetchMeetingRooms = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_BASE_URL}/api/v1/meeting-rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setRooms(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch meeting rooms')
      }
    } catch (err: any) {
      console.error('Error fetching meeting rooms:', err)
      setError(err.response?.data?.message || 'Failed to fetch meeting rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetingRooms()
  }, [fetchMeetingRooms])

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Room name is required'
    }

    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }

    if (!formData.floor.trim()) {
      errors.floor = 'Floor is required'
    }

    if (!formData.capacity || formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const token = localStorage.getItem('access_token')
      const payload = {
        name: formData.name,
        location: formData.location,
        floor: formData.floor,
        capacity: Number(formData.capacity),
        facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
        status: formData.status,
        is_active: formData.is_active,
      }

      let response
      if (editingRoom) {
        // Update existing room
        response = await axios.put(
          `${API_BASE_URL}/api/v1/meeting-rooms/${editingRoom.id}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      } else {
        // Create new room
        response = await axios.post(
          `${API_BASE_URL}/api/v1/meeting-rooms`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      }

      if (response.data.success) {
        setSuccessMessage(
          editingRoom ? 'Meeting room updated successfully!' : 'Meeting room created successfully!'
        )
        setDialogOpen(false)
        resetForm()
        await fetchMeetingRooms()
      } else {
        setError(response.data.message || 'Failed to save meeting room')
      }
    } catch (err: any) {
      console.error('Error saving meeting room:', err)
      setError(err.response?.data?.message || 'Failed to save meeting room')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (room: MeetingRoom) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"?`)) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.delete(`${API_BASE_URL}/api/v1/meeting-rooms/${room.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setSuccessMessage('Meeting room deleted successfully!')
        await fetchMeetingRooms()
      } else {
        setError(response.data.message || 'Failed to delete meeting room')
      }
    } catch (err: any) {
      console.error('Error deleting meeting room:', err)
      setError(err.response?.data?.message || 'Failed to delete meeting room')
    } finally {
      setLoading(false)
    }
  }

  // Open create dialog
  const handleOpenCreate = () => {
    resetForm()
    setEditingRoom(null)
    setDialogOpen(true)
  }

  // Open edit dialog
  const handleOpenEdit = (room: MeetingRoom) => {
    setFormData({
      name: room.name,
      location: room.location,
      floor: room.floor,
      capacity: room.capacity,
      facilities: room.facilities.join(', '),
      status: room.status,
      is_active: room.is_active,
    })
    setEditingRoom(room)
    setDialogOpen(true)
  }

  // Open view dialog
  const handleOpenView = (room: MeetingRoom) => {
    setSelectedRoom(room)
    setViewDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      floor: '',
      capacity: '',
      facilities: '',
      status: 'available',
      is_active: true,
    })
    setFormErrors({})
  }

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'name',
      headerName: 'Room Name',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <MeetingRoomIcon fontSize="small" color="primary" />
          <Typography>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
    },
    {
      field: 'floor',
      headerName: 'Floor',
      width: 100,
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'facilities',
      headerName: 'Facilities',
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {params.value.slice(0, 2).map((facility: string, idx: number) => (
            <Chip key={idx} label={facility} size="small" />
          ))}
          {params.value.length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" color="info" />
          )}
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const colors: Record<string, 'success' | 'error' | 'warning'> = {
          available: 'success',
          unavailable: 'error',
          maintenance: 'warning',
        }
        return <Chip label={params.value} color={colors[params.value] || 'default'} size="small" />
      },
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value ? 'Yes' : 'No'} color={params.value ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" color="info" onClick={() => handleOpenView(params.row)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Meeting Rooms Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button startIcon={<RefreshIcon />} onClick={fetchMeetingRooms} disabled={loading}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Add Meeting Room
            </Button>
          </Stack>
        </Stack>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* DataGrid */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rooms}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Meeting Room' : 'Add Meeting Room'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                error={Boolean(formErrors.location)}
                helperText={formErrors.location}
                placeholder="e.g., Building A"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Floor *"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                error={Boolean(formErrors.floor)}
                helperText={formErrors.floor}
                placeholder="e.g., 3rd Floor"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacity *"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? Number(e.target.value) : '' })}
                error={Boolean(formErrors.capacity)}
                helperText={formErrors.capacity}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Facilities"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                error={Boolean(formErrors.facilities)}
                helperText={formErrors.facilities || 'Comma-separated list (e.g., Projector, Whiteboard, WiFi)'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Active</InputLabel>
                <Select
                  value={formData.is_active ? 'true' : 'false'}
                  label="Active"
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingRoom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <MeetingRoomIcon />
                <Typography variant="h6">{selectedRoom.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1">{selectedRoom.location}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Floor
                        </Typography>
                        <Typography variant="body1">{selectedRoom.floor}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Capacity
                        </Typography>
                        <Typography variant="body1">{selectedRoom.capacity} people</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedRoom.status}
                          color={
                            selectedRoom.status === 'available'
                              ? 'success'
                              : selectedRoom.status === 'maintenance'
                                ? 'warning'
                                : 'error'
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Facilities
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {selectedRoom.facilities.map((facility, idx) => (
                            <Chip key={idx} label={facility} size="small" />
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default MeetingRooms
