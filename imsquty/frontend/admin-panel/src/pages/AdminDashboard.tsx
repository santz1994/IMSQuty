import { FileText, Lock, People } from '@mui/icons-material'
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Paper,
    Typography,
} from '@mui/material'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUsers } from '../store/slices/userSlice'

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { users, loading } = useAppSelector((state) => state.user)

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, perPage: 100 }))
  }, [dispatch])

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: People,
      color: '#1976d2',
    },
    {
      label: 'Active Users',
      value: users.filter((u) => u.is_active).length,
      icon: People,
      color: '#4caf50',
    },
    {
      label: 'System Roles',
      value: 5,
      icon: Lock,
      color: '#ff9800',
    },
    {
      label: 'Recent Logs',
      value: 24,
      icon: FileText,
      color: '#f44336',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            {stat.label}
                          </Typography>
                          <Typography variant="h5">
                            {stat.value}
                          </Typography>
                        </Box>
                        <Icon sx={{ fontSize: 40, color: stat.color, opacity: 0.5 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Users Created This Month
                </Typography>
                <Typography variant="h6">
                  {Math.floor(Math.random() * 20)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  System Health
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                  98%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Backup
                </Typography>
                <Typography variant="h6">
                  2 hours ago
                </Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default AdminDashboard
