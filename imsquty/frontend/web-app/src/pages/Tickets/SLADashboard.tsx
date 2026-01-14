import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface SLAStatus {
  success: boolean
  ticket_id: number
  sla_policy?: {
    id: number
    name: string
    response_time_hours: number
    resolution_time_hours: number
  }
  response?: {
    status: string
    deadline: string
    elapsed_minutes: number
    remaining_minutes: number
    is_breached: boolean
  }
  resolution?: {
    status: string
    deadline: string
    elapsed_minutes: number
    remaining_minutes: number
    is_breached: boolean
  }
  overall_status: string
  ticket_status?: string
  created_at?: string
}

interface TicketWithSLA {
  id: number
  ticket_code: string
  subject: string
  priority_name: string
  status_name: string
  assigned_to?: string
  created_at: string
  sla_status?: SLAStatus
}

interface SLAStatistics {
  total_tickets: number
  met: number
  at_risk: number
  breached: number
  compliance_percentage: number
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SLADashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<SLAStatistics | null>(null)
  const [breachedTickets, setBreachedTickets] = useState<TicketWithSLA[]>([])
  const [atRiskTickets, setAtRiskTickets] = useState<TicketWithSLA[]>([])
  const [allTickets, setAllTickets] = useState<TicketWithSLA[]>([])
  const [selectedTicket, setSelectedTicket] = useState<TicketWithSLA | null>(null)
  const [selectedSLA, setSelectedSLA] = useState<SLAStatus | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [escalationOpen, setEscalationOpen] = useState(false)
  const [escalationReason, setEscalationReason] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [autoAssignOpen, setAutoAssignOpen] = useState(false)

  // Fetch SLA statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/tickets/sla/statistics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setStatistics(response.data.statistics)
    } catch (err) {
      console.error('Error fetching SLA statistics:', err)
    }
  }

  // Fetch breached tickets
  const fetchBreachedTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/tickets/sla/overdue`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setBreachedTickets(response.data.tickets || [])
    } catch (err) {
      console.error('Error fetching breached tickets:', err)
    }
  }

  // Fetch at-risk tickets
  const fetchAtRiskTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/tickets/sla/at-risk`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setAtRiskTickets(response.data.tickets || [])
    } catch (err) {
      console.error('Error fetching at-risk tickets:', err)
    }
  }

  // Fetch all tickets with SLA
  const fetchAllTickets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_BASE}/api/v1/tickets?page=${page}&per_page=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )
      setAllTickets(response.data.data || [])
      setTotalItems(response.data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  // Get SLA status for a ticket
  const getSLAStatus = async (ticketId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/tickets/sla/${ticketId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      return response.data
    } catch (err) {
      console.error('Error fetching SLA status:', err)
      return null
    }
  }

  // Check if ticket should be escalated
  const checkEscalation = async (ticketId: number) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/tickets/sla/${ticketId}/escalation`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )
      return response.data
    } catch (err) {
      console.error('Error checking escalation:', err)
      return null
    }
  }

  // Auto-assign tickets to admin role
  const handleAutoAssign = async () => {
    try {
      // Get all unassigned tickets
      const unassignedResponse = await axios.get(
        `${API_BASE}/api/v1/tickets?assigned_to=null`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )

      const unassignedTickets = unassignedResponse.data.data || []

      // Assign to first available admin
      for (const ticket of unassignedTickets) {
        try {
          await axios.put(
            `${API_BASE}/api/v1/tickets/${ticket.id}`,
            {
              assigned_to: user?.id,
              assignment_type: 'auto',
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          )
        } catch (err) {
          console.error(`Error assigning ticket ${ticket.id}:`, err)
        }
      }

      setAutoAssignOpen(false)
      await fetchAllTickets()
      alert(`Successfully auto-assigned ${unassignedTickets.length} tickets`)
    } catch (err) {
      alert('Error during auto-assignment')
      console.error('Auto-assignment error:', err)
    }
  }

  // Handle ticket details view
  const handleViewDetails = async (ticket: TicketWithSLA) => {
    setSelectedTicket(ticket)
    const slaStatus = await getSLAStatus(ticket.id)
    setSelectedSLA(slaStatus)
    setDetailsOpen(true)
  }

  // Handle escalation
  const handleEscalate = async () => {
    if (!selectedTicket) return

    try {
      // Escalate by updating priority
      await axios.put(
        `${API_BASE}/api/v1/tickets/${selectedTicket.id}`,
        {
          escalated: true,
          escalation_reason: escalationReason,
          escalated_at: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      )

      setEscalationOpen(false)
      setEscalationReason('')
      await fetchAllTickets()
      alert('Ticket escalated successfully')
    } catch (err) {
      alert('Error escalating ticket')
      console.error('Escalation error:', err)
    }
  }

  // Initial load
  useEffect(() => {
    fetchStatistics()
    fetchBreachedTickets()
    fetchAtRiskTickets()
    fetchAllTickets()
  }, [page, pageSize])

  // Format remaining time for display
  const formatRemainingTime = (minutes: number): string => {
    if (minutes < 0) return 'OVERDUE'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Get status color
  const getStatusColor = (status: string): 'error' | 'warning' | 'success' | 'info' => {
    switch (status?.toLowerCase()) {
      case 'breached':
        return 'error'
      case 'at risk':
        return 'warning'
      case 'met':
        return 'success'
      default:
        return 'info'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'info'
    }
  }

  const getTotalPages = Math.ceil(totalItems / pageSize)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimerIcon /> SLA Management Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Monitor ticket SLA compliance, breaches, and escalation management
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Tickets
                    </Typography>
                    <Typography variant="h5">{statistics.total_tickets}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#f1f8e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#388e3c' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      SLA Met
                    </Typography>
                    <Typography variant="h5">{statistics.met}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 40, color: '#f57c00' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      At Risk
                    </Typography>
                    <Typography variant="h5">{statistics.at_risk}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Breached
                    </Typography>
                    <Typography variant="h5">{statistics.breached}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Compliance Percentage */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    <Typography variant="h6">SLA Compliance Rate</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {statistics.compliance_percentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistics.compliance_percentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Breached Tickets Section */}
      {breachedTickets.length > 0 && (
        <Card sx={{ mb: 3, borderLeft: '4px solid #d32f2f' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ErrorIcon sx={{ color: '#d32f2f' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🚨 SLA Breached ({breachedTickets.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#ffebee' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time Overdue</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breachedTickets.slice(0, 5).map((ticket) => (
                    <TableRow key={ticket.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{ticket.ticket_code}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority_name}
                          color={getPriorityColor(ticket.priority_name)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.status_name}</TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        OVERDUE
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(ticket)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setEscalationOpen(true)
                          }}
                        >
                          Escalate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* At-Risk Tickets Section */}
      {atRiskTickets.length > 0 && (
        <Card sx={{ mb: 3, borderLeft: '4px solid #f57c00' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningIcon sx={{ color: '#f57c00' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ⚠️ At Risk of SLA Breach ({atRiskTickets.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#fff3e0' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ticket</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time Remaining</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {atRiskTickets.slice(0, 5).map((ticket) => (
                    <TableRow key={ticket.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{ticket.ticket_code}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority_name}
                          color={getPriorityColor(ticket.priority_name)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.status_name}</TableCell>
                      <TableCell sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                        &lt; 2 hours
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(ticket)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* All Tickets Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📋 All Tickets with SLA
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchAllTickets}
                size="small"
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={() => setAutoAssignOpen(true)}
                size="small"
              >
                Auto-Assign
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ticket #</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        SLA Status
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allTickets.map((ticket) => (
                      <TableRow key={ticket.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{ticket.ticket_code}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.priority_name}
                            color={getPriorityColor(ticket.priority_name)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{ticket.status_name}</TableCell>
                        <TableCell>{ticket.assigned_to || '—'}</TableCell>
                        <TableCell>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label="View"
                            size="small"
                            onClick={() => handleViewDetails(ticket)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            onClick={() => handleViewDetails(ticket)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={getTotalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📋 SLA Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedTicket && selectedSLA && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Ticket Information
              </Typography>
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Code:</strong> {selectedTicket.ticket_code}
                </Typography>
                <Typography variant="body2">
                  <strong>Subject:</strong> {selectedTicket.subject}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedTicket.status_name}
                </Typography>
              </Box>

              {selectedSLA.sla_policy && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    SLA Policy: {selectedSLA.sla_policy.name}
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="body2">
                      First Response: <strong>{selectedSLA.sla_policy.response_time_hours}h</strong>
                    </Typography>
                    <Typography variant="body2">
                      Resolution: <strong>{selectedSLA.sla_policy.resolution_time_hours}h</strong>
                    </Typography>
                  </Box>
                </>
              )}

              {selectedSLA.response && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📞 First Response SLA
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Status:</Typography>
                      <Chip
                        label={selectedSLA.response.status}
                        color={getStatusColor(selectedSLA.response.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2">
                      Deadline: {new Date(selectedSLA.response.deadline).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Elapsed: {selectedSLA.response.elapsed_minutes} minutes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedSLA.response.is_breached ? '#d32f2f' : '#1976d2',
                      }}
                    >
                      Remaining:{' '}
                      {selectedSLA.response.is_breached
                        ? '⏱️ OVERDUE'
                        : formatRemainingTime(selectedSLA.response.remaining_minutes)}
                    </Typography>
                  </Box>
                </>
              )}

              {selectedSLA.resolution && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✅ Resolution SLA
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Status:</Typography>
                      <Chip
                        label={selectedSLA.resolution.status}
                        color={getStatusColor(selectedSLA.resolution.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2">
                      Deadline: {new Date(selectedSLA.resolution.deadline).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Elapsed: {selectedSLA.resolution.elapsed_minutes} minutes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedSLA.resolution.is_breached ? '#d32f2f' : '#1976d2',
                      }}
                    >
                      Remaining:{' '}
                      {selectedSLA.resolution.is_breached
                        ? '⏱️ OVERDUE'
                        : formatRemainingTime(selectedSLA.resolution.remaining_minutes)}
                    </Typography>
                  </Box>
                </>
              )}

              <Box sx={{ p: 2, backgroundColor: '#f1f8e9', borderRadius: 1, border: '1px solid #c5e1a5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ color: '#558b2f', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#558b2f' }}>
                    Overall Status
                  </Typography>
                </Box>
                <Chip
                  label={selectedSLA.overall_status}
                  color={getStatusColor(selectedSLA.overall_status)}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={escalationOpen} onClose={() => setEscalationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔔 Escalate Ticket</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Escalation Reason"
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            placeholder="Explain why this ticket needs escalation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalationOpen(false)}>Cancel</Button>
          <Button onClick={handleEscalate} variant="contained" color="error">
            Escalate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-Assign Dialog */}
      <Dialog open={autoAssignOpen} onClose={() => setAutoAssignOpen(false)}>
        <DialogTitle>🔄 Auto-Assign Tickets</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            This will automatically assign all unassigned tickets to the admin role. This action cannot be undone
            immediately. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAutoAssign} variant="contained">
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SLADashboard
