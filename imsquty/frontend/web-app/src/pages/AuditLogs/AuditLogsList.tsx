import { Search } from '@mui/icons-material'
import {
  Box,
  Chip,
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

const mockLogs = [
  { id: 1, timestamp: '2026-01-06 10:30:45', user: 'admin@imsquty.local', action: 'CREATE', resource: 'Asset', resourceId: '123', status: 'success', ipAddress: '192.168.1.100' },
  { id: 2, timestamp: '2026-01-06 09:15:30', user: 'john@imsquty.local', action: 'UPDATE', resource: 'Ticket', resourceId: '456', status: 'success', ipAddress: '192.168.1.101' },
  { id: 3, timestamp: '2026-01-06 08:45:12', user: 'sarah@imsquty.local', action: 'DELETE', resource: 'Document', resourceId: '789', status: 'success', ipAddress: '192.168.1.102' },
  { id: 4, timestamp: '2026-01-05 16:20:00', user: 'admin@imsquty.local', action: 'LOGIN', resource: 'User', resourceId: '1', status: 'success', ipAddress: '192.168.1.100' },
]

const AuditLogsList: React.FC = () => {
  const [logs, setLogs] = useState(mockLogs)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = logs.filter(log =>
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getActionColor = (action: string): "success" | "warning" | "error" | "default" | "primary" | "secondary" | "info" => {
    switch (action) {
      case 'CREATE': return 'success'
      case 'UPDATE': return 'info'
      case 'DELETE': return 'error'
      case 'LOGIN': return 'primary'
      default: return 'default'
    }
  }

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
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell><Chip label={log.action} color={getActionColor(log.action)} size="small" /></TableCell>
                  <TableCell>{log.resource} #{log.resourceId}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell><Chip label={log.status.toUpperCase()} color="success" size="small" /></TableCell>
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
