import { Add, ArrowBack } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
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
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createTicket } from '../../store/slices/ticketSlice'
import { fetchTicketPriorities } from '../../store/slices/ticketPrioritySlice'
import { fetchTicketStatuses } from '../../store/slices/ticketStatusSlice'

interface CreateTicketFormData {
  ticket_number?: string
  title: string
  description: string
  ticket_type_id?: number
  ticket_status_id?: number
  priority: string
  created_by?: number
  assigned_to?: number
  location_id?: number
  asset_id?: number
  due_date?: string
}

const TicketCreate: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.ticket)
  const { priorities } = useAppSelector((state) => state.ticketPriority)
  const { statuses } = useAppSelector((state) => state.ticketStatus)
  const [formData, setFormData] = useState<CreateTicketFormData>({
    title: '',
    description: '',
    priority: 'medium',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Load priorities and statuses on mount
  useEffect(() => {
    dispatch(fetchTicketPriorities() as any)
    dispatch(fetchTicketStatuses() as any)
  }, [dispatch])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      dispatch(createTicket(formData))
      navigate('/tickets')
    }
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create New Ticket
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
                required
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
                error={!!validationErrors.description}
                helperText={validationErrors.description}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  label="Priority"
                  value={formData.priority || 'medium'}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="ticket_status_id"
                  label="Status"
                  value={formData.ticket_status_id || ''}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                name="assigned_to"
                type="number"
                value={formData.assigned_to || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location_id"
                type="number"
                value={formData.location_id || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Asset"
                name="asset_id"
                type="number"
                value={formData.asset_id || ''}
                onChange={handleChange}
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
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<Add />}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}

export default TicketCreate
