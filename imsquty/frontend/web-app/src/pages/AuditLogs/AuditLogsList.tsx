import { Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useAuditLogs } from '../../hooks/useAuditLogs'

const AuditLogsList: React.FC = () => {
  const { auditLogs, loading, error, fetchAuditLogs, searchAuditLogs } = useAuditLogs(true)
  const logs = auditLogs
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = logs.filter(log =>
    log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getActionColor = (action: string): "success" | "warning" | "error" | "default" | "primary" | "secondary" | "info" => {
    if (action.includes('CREATE') || action.includes('created')) return 'success'
    if (action.includes('UPDATE') || action.includes('updated')) return 'info'
    if (action.includes('DELETE') || action.includes('deleted')) return 'error'
    if (action.includes('LOGIN') || action.includes('login')) return 'primary'
    return 'default'
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button onClick={() => fetchAuditLogs()}>Retry</Button>}>{error}</Alert></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Audit Logs</Typography>

        <TextField
          placeholder="Search by user, resource, or action..."
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'gray' }} /> }}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0) }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Resource</strong></TableCell>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? paginated.map(log => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.created_at}</TableCell>
                  <TableCell>{log.user_name || log.user_email || 'System'}</TableCell>
                  <TableCell><Chip label={log.action} color={getActionColor(log.action)} size="small" /></TableCell>
                  <TableCell>{log.entity_type} #{log.entity_id || 'N/A'}</TableCell>
                  <TableCell>{log.ip_address || 'N/A'}</TableCell>
                  <TableCell><Chip label={log.severity?.toUpperCase() || 'INFO'} color={log.severity === 'error' ? 'error' : 'success'} size="small" /></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><Typography color="textSecondary">No logs found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          />
        </TableContainer>
      </Stack>
    </Box>
  )
}

export default AuditLogsList
