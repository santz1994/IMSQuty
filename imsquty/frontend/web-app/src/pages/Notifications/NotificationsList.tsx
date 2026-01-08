import { Delete, Mail, MailOutline } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

const typeColor = (type: string): any => {
  switch (type) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    case 'success': return 'success'
    default: return 'default'
  }
}

export default function NotificationsList() {
  const { notifications, unreadCount, loading, error, fetchNotifications, markAsRead, deleteNotification } = useNotifications(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const paginatedNotifications = notifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleToggleRead = async (id: number) => {
    await markAsRead(id)
  }

  const handleDelete = async (id: number) => {
    await deleteNotification(id)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button onClick={fetchNotifications}>Retry</Button>}>{error}</Alert></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5">
            Notifications
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="error"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width="50">Read</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedNotifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  hover
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : '#f9f9f9',
                  }}
                >
                  <TableCell>
                    <Tooltip title={notification.read ? 'Mark as unread' : 'Mark as read'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRead(notification.id)}
                      >
                        {notification.read ? (
                          <MailOutline fontSize="small" />
                        ) : (
                          <Mail fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.type}
                      color={typeColor(notification.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{notification.title}: {notification.message}</TableCell>
                  <TableCell>{notification.created_at}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={notifications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Stack>
    </Box>
  )
}
