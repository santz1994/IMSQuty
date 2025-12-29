import {
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    MenuItem,
    Paper,
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
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { PaginationControls } from '../../components/PaginationControls'

interface AuditLog {
  id: number
  user_id: number
  user_name: string
  action: string
  entity_type: string
  entity_id: number
  old_values: Record<string, any>
  new_values: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
  updated_at: string
}

/**
 * AuditLogs Page
 * Admin-only page for viewing system audit logs
 * Features: Log viewer, filtering, export, pagination
 */
const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Filters
  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  // Load logs
  useEffect(() => {
    loadLogs()
  }, [page, pageSize, filterAction, filterEntity, filterUser, filterDateFrom, filterDateTo])

  const loadLogs = async () => {
    try {
      setLoading(true)
      setErrorMessage('')

      const params = {
        page,
        per_page: pageSize,
        ...(filterAction && { action: filterAction }),
        ...(filterEntity && { entity_type: filterEntity }),
        ...(filterUser && { user_name: filterUser }),
        ...(filterDateFrom && { date_from: filterDateFrom }),
        ...(filterDateTo && { date_to: filterDateTo }),
      }

      const response = await axios.get('/api/v1/admin/audit-logs', { params })
      if (response.data.success) {
        setLogs(response.data.data.logs || [])
        setTotal(response.data.data.pagination?.total || 0)
      }
    } catch (error: any) {
      setErrorMessage('Failed to load audit logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilterAction('')
    setFilterEntity('')
    setFilterUser('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setPage(1)
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/admin/audit-logs/export', {
        params: {
          action: filterAction || undefined,
          entity_type: filterEntity || undefined,
          user_name: filterUser || undefined,
          date_from: filterDateFrom || undefined,
          date_to: filterDateTo || undefined,
        },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)

      setSuccessMessage('Logs exported successfully')
    } catch (error: any) {
      setErrorMessage('Failed to export logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearOldLogs = async () => {
    if (!window.confirm('Are you sure? This will delete all logs older than 90 days.')) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete('/api/v1/admin/audit-logs/old')
      if (response.data.success) {
        setSuccessMessage(response.data.message)
        await loadLogs()
      }
    } catch (error: any) {
      setErrorMessage('Failed to clear old logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success'
      case 'UPDATE':
        return 'info'
      case 'DELETE':
        return 'error'
      case 'LOGIN':
        return 'primary'
      case 'LOGOUT':
        return 'warning'
      default:
        return 'default'
    }
  }

  if (loading && logs.length === 0) return <CircularProgress />

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Audit Logs</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadLogs()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading || logs.length === 0}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearOldLogs}
            disabled={loading}
          >
            Clear Old
          </Button>
        </Stack>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filters
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="User Name"
            value={filterUser}
            onChange={(e) => {
              setFilterUser(e.target.value)
              setPage(1)
            }}
            size="small"
            disabled={loading}
          />
          <TextField
            label="Action"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value)
              setPage(1)
            }}
            size="small"
            disabled={loading}
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="LOGIN">Login</MenuItem>
            <MenuItem value="LOGOUT">Logout</MenuItem>
          </TextField>
          <TextField
            label="Entity Type"
            value={filterEntity}
            onChange={(e) => {
              setFilterEntity(e.target.value)
              setPage(1)
            }}
            size="small"
            disabled={loading}
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Asset">Asset</MenuItem>
            <MenuItem value="Ticket">Ticket</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
          <TextField
            label="Date From"
            type="date"
            value={filterDateFrom}
            onChange={(e) => {
              setFilterDateFrom(e.target.value)
              setPage(1)
            }}
            size="small"
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date To"
            type="date"
            value={filterDateTo}
            onChange={(e) => {
              setFilterDateTo(e.target.value)
              setPage(1)
            }}
            size="small"
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            disabled={loading}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Clear Filters
          </Button>
        </Stack>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date/Time</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Alert severity="info" sx={{ border: 'none' }}>
                    No audit logs found
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {log.entity_type} #{log.entity_id}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{log.ip_address}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    <Typography variant="caption" component="div">
                      {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <>
                          <strong>Changed:</strong> {Object.keys(log.old_values).join(', ')}
                        </>
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizes={[5, 10, 25, 50]}
      />
    </Box>
  )
}

export default AuditLogs
