import { Delete, Mail, MailOutline } from '@mui/icons-material'
import {
  Box,
  Chip,
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

interface Notification {
  id: number
  type: 'assignment' | 'alert' | 'info' | 'warning' | 'success'
  message: string
  date: string
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: 1, type: 'assignment', message: 'You have been assigned to Asset #123', date: '2024-01-06 10:30', read: false },
  { id: 2, type: 'alert', message: 'Maintenance due for equipment at Office A', date: '2024-01-06 09:15', read: true },
  { id: 3, type: 'info', message: 'New ticket #456 created', date: '2024-01-05 14:45', read: true },
  { id: 4, type: 'warning', message: 'Low inventory alert: USB Cables (150 units)', date: '2024-01-05 11:20', read: false },
  { id: 5, type: 'success', message: 'Ticket #123 has been resolved', date: '2024-01-04 16:30', read: true },
]

const typeColor = (type: Notification['type']): any => {
  switch (type) {
    case 'alert': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    case 'assignment': return 'primary'
    case 'success': return 'success'
    default: return 'default'
  }
}

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const paginatedNotifications = notifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleToggleRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: !n.read } : n
    ))
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>{notification.date}</TableCell>
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
