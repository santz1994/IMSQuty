import { ArrowBack, Delete, Save } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField'
import { useNotification } from '../../context/NotificationContext'
import { useTicketForm, useTicketFormSubmit } from '../../hooks/useTicketForm'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { deleteTicket, fetchTicket, updateTicket } from '../../store/slices/ticketSlice'

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { currentTicket, loading, error: ticketError } = useAppSelector(
    (state) => state.ticket,
  )
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, errors, isSubmitting, control, setValue } = useTicketForm()

  const submitHandler = useTicketFormSubmit(async (data) => {
    try {
      if (!id) throw new Error('Ticket ID not found')

      const result = await dispatch(
        updateTicket({
          id: parseInt(id),
          data: {
            ...data,
            assigned_to: data.assigned_to ? Number(data.assigned_to) : undefined,
            asset_id: data.asset_id ? Number(data.asset_id) : undefined,
          } as any,
        }),
      )

      if (result.payload) {
        showNotification('Ticket updated successfully!', 'success')
        setIsEditing(false)
      } else {
        showNotification('Failed to update ticket', 'error')
      }
    } catch (err) {
      console.error('Failed to update ticket:', err)
      showNotification('An error occurred while updating ticket', 'error')
    }
  })

  // Load ticket on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchTicket(parseInt(id)) as any)
    }
  }, [id, dispatch])

  // Pre-populate form with current ticket data
  useEffect(() => {
    if (currentTicket && isEditing) {
      setValue('ticket_number', currentTicket.ticket_number)
      setValue('title', currentTicket.title)
      setValue('description', currentTicket.description)
      setValue('priority', currentTicket.priority)
      setValue('status', currentTicket.status || '')
      setValue('assigned_to', currentTicket.assigned_to)
      setValue('due_date', new Date(currentTicket.due_date))
      setValue('asset_id', currentTicket.asset_id)
      setValue('tags', currentTicket.tags || '')
    }
  }, [currentTicket, isEditing, setValue])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      if (id) {
        try {
          await dispatch(deleteTicket(parseInt(id)))
          showNotification('Ticket deleted successfully!', 'success')
          navigate('/tickets')
        } catch (err) {
          showNotification('Failed to delete ticket', 'error')
        }
      }
    }
  }

  const onSubmit = async (data: any) => {
    await submitHandler(data)
  }

  if (loading) return <CircularProgress />
  if (ticketError) return <Alert severity="error">{ticketError}</Alert>
  if (!currentTicket) return <Alert severity="warning">Ticket not found</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Ticket: {currentTicket?.ticket_number}
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
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={isEditing}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {ticketError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {ticketError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup spacing={2.5}>
            {!isEditing ? (
              <>
                {/* View Mode */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Basic Information
                </Typography>

                <FormField
                  label="Ticket Number"
                  value={currentTicket?.ticket_number || ''}
                  disabled
                />

                <FormField
                  label="Title"
                  value={currentTicket?.title || ''}
                  disabled
                />

                <FormField
                  label="Description"
                  multiline
                  rows={4}
                  value={currentTicket?.description || ''}
                  disabled
                />

                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Ticket Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Priority"
                      value={currentTicket?.priority || ''}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Status"
                      value={currentTicket?.status || ''}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Assigned To"
                      value={currentTicket?.assigned_to || 'Unassigned'}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Due Date"
                      type="date"
                      value={currentTicket?.due_date || ''}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Asset ID"
                      value={currentTicket?.asset_id || ''}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Tags"
                      value={currentTicket?.tags || ''}
                      disabled
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Edit Ticket
                </Typography>

                <FormField
                  label="Ticket Number"
                  value={currentTicket?.ticket_number || ''}
                  disabled
                />

                <FormField
                  label="Title"
                  placeholder="Ticket title"
                  error={errors.title}
                  required
                  {...register('title')}
                />

                <FormField
                  label="Description"
                  multiline
                  rows={4}
                  placeholder="Ticket description"
                  error={errors.description}
                  required
                  {...register('description')}
                />

                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Update Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ControlledFormSelect
                      control={control}
                      name="priority"
                      label="Priority"
                      options={[
                        { label: 'Low', value: 'Low' },
                        { label: 'Medium', value: 'Medium' },
                        { label: 'High', value: 'High' },
                        { label: 'Critical', value: 'Critical' },
                      ]}
                      error={errors.priority}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <ControlledFormSelect
                      control={control}
                      name="status"
                      label="Status"
                      options={[
                        { label: 'Open', value: 'Open' },
                        { label: 'In Progress', value: 'In Progress' },
                        { label: 'Pending Info', value: 'Pending Info' },
                        { label: 'Resolved', value: 'Resolved' },
                        { label: 'Closed', value: 'Closed' },
                      ]}
                      error={errors.status}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Assigned To"
                      type="number"
                      placeholder="User ID"
                      error={errors.assigned_to}
                      {...register('assigned_to')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Due Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={errors.due_date}
                      required
                      {...register('due_date')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Asset ID"
                      type="number"
                      placeholder="Asset ID"
                      error={errors.asset_id}
                      {...register('asset_id')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Tags"
                      placeholder="Tags (comma-separated)"
                      error={errors.tags}
                      {...register('tags')}
                    />
                  </Grid>
                </Grid>

                {/* Form Actions */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </>
            )}
          </FormGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default TicketDetail
