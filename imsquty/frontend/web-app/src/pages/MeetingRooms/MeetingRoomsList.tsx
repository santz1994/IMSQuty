import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

const mockRooms = [
  { id: 1, name: 'Conference Room A', capacity: 10, floor: '2nd', status: 'available', features: ['Projector', 'Whiteboard', 'Video Conference'] },
  { id: 2, name: 'Meeting Room B', capacity: 6, floor: '3rd', status: 'booked', features: ['Whiteboard', 'TV Monitor'] },
  { id: 3, name: 'Board Room', capacity: 20, floor: '1st', status: 'available', features: ['Projector', 'Video Conference', 'Audio System'] },
  { id: 4, name: 'Training Room', capacity: 30, floor: '4th', status: 'available', features: ['Projector', 'Microphone', 'Whiteboard'] },
]

const MeetingRoomsList: React.FC = () => {
  const [rooms, setRooms] = useState(mockRooms)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', capacity: '', floor: '', features: '' })

  const handleOpenDialog = () => {
    setFormData({ name: '', capacity: '', floor: '', features: '' })
    setOpenDialog(true)
  }

  const handleSave = () => {
    const newRoom = {
      id: Math.max(...rooms.map(r => r.id), 0) + 1,
      name: formData.name,
      capacity: parseInt(formData.capacity),
      floor: formData.floor,
      status: 'available',
      features: formData.features.split(',').map(f => f.trim()),
    }
    setRooms([...rooms, newRoom])
    setOpenDialog(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Meeting Rooms</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            Add Room
          </Button>
        </Box>

        <Grid container spacing={3}>
          {rooms.map(room => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{room.name}</Typography>
                  <Typography color="textSecondary" gutterBottom>Floor: {room.floor}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Capacity: {room.capacity} people</Typography>
                  <Chip label={room.status.toUpperCase()} color={room.status === 'available' ? 'success' : 'warning'} size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="textSecondary"><strong>Features:</strong></Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {room.features.map((feature, idx) => (
                      <Chip key={idx} label={feature} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Meeting Room</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField label="Room Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Capacity" type="number" fullWidth value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              <TextField label="Floor" fullWidth value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} />
              <TextField label="Features (comma separated)" fullWidth value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default MeetingRoomsList
