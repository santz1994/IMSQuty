import { Add, ArrowBack } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Typography,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField'
import { useTicketForm, useTicketFormSubmit } from '../../hooks/useTicketForm'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createTicket } from '../../store/slices/ticketSlice'

const TicketCreate: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error: ticketError } = useAppSelector((state) => state.ticket)

  const { register, handleSubmit, errors, isSubmitting, control } = useTicketForm()

  const submitHandler = useTicketFormSubmit(async (data) => {
    try {
      const result = await dispatch(
        createTicket({
          ...data,
          assigned_to: data.assigned_to ? Number(data.assigned_to) : undefined,
          asset_id: data.asset_id ? Number(data.asset_id) : undefined,
        } as any),
      )

      if (result.payload) {
        navigate('/tickets')
      }
    } catch (err) {
      console.error('Failed to create ticket:', err)
    }
  })

  const onSubmit = async (data: any) => {
    await submitHandler(data)
  }

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
        <Typography variant="h4">Create New Ticket</Typography>
      </Box>

      {ticketError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {ticketError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup spacing={2.5}>
            {/* Basic Information */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Basic Information
            </Typography>

            <FormField
              label="Ticket Number"
              placeholder="e.g., TKT-001"
              error={errors.ticket_number}
              required
              {...register('ticket_number')}
            />

            <FormField
              label="Title"
              placeholder="e.g., Hardware Issue"
              error={errors.title}
              required
              {...register('title')}
            />

            <FormField
              label="Description"
              multiline
              rows={4}
              placeholder="Describe the issue in detail..."
              error={errors.description}
              required
              {...register('description')}
            />

            {/* Ticket Details */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Ticket Details
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
            </Grid>

            {/* Assignment & Dates */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Assignment & Due Date
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormField
                  label="Assigned To"
                  type="number"
                  placeholder="User ID (optional)"
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
                  placeholder="Asset ID (optional)"
                  error={errors.asset_id}
                  {...register('asset_id')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormField
                  label="Tags"
                  placeholder="e.g., urgent, hardware, network"
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
                    <Add />
                  )
                }
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Creating...' : 'Create Ticket'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/tickets')}
                disabled={isSubmitting || loading}
              >
                Cancel
              </Button>
            </Box>
          </FormGroup>
        </form>
      </Paper>
    </Box>
  )
}

export default TicketCreate
