import { ArrowBack, Delete, Save } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchTicketPriorities } from '../../store/slices/ticketPrioritySlice'
import { deleteTicket, fetchTicket, updateTicket } from '../../store/slices/ticketSlice'
import { fetchTicketStatuses } from '../../store/slices/ticketStatusSlice'

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentTicket, loading, error } = useAppSelector(
    (state) => state.ticket,
  )
  const { priorities } = useAppSelector((state) => state.ticketPriority)
  const { statuses } = useAppSelector((state) => state.ticketStatus)
  const [formData, setFormData] = useState(currentTicket)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchTicket(parseInt(id)))
      dispatch(fetchTicketPriorities() as any)
      dispatch(fetchTicketStatuses() as any)
    }
  }, [id, dispatch])

  useEffect(() => {
    if (currentTicket) {
      setFormData(currentTicket)
    }
  }, [currentTicket])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData && id) {
      dispatch(updateTicket({ id: parseInt(id), data: formData }))
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      if (id) {
        dispatch(deleteTicket(parseInt(id)))
        navigate('/tickets')
      }
    }
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!formData) return <Alert severity="warning">Ticket not found</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
        >
          Back
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Ticket: {formData.ticket_number}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing && (
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            {isEditing && (
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(currentTicket)
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ticket Number"
                value={formData.ticket_number}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    label="Priority"
                    value={formData?.priority || 'medium'}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    {priorities.map((p) => (
                      <MenuItem key={p.id} value={p.name}>
                        {p.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="Priority"
                  value={formData?.priority}
                  disabled
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="ticket_status_id"
                    label="Status"
                    value={formData?.ticket_status_id || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ticket_status_id: Number(e.target.value) || undefined,
                      }))
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {statuses.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label="Status"
                  value={formData?.ticket_status_id || 'N/A'}
                  disabled
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData?.title}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                value={formData.ticket_status_id}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                name="assigned_to"
                value={formData.assigned_to || ''}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location_id || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Asset"
                value={formData.asset_id || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={handleChange}
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {isEditing && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<Save />}
                >
                  Save Changes
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default TicketDetail
