import { Block as BlockIcon } from '@mui/icons-material'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleHierarchyInfo } from '../hooks/useAdminAccess'
import { useAppSelector } from '../store/hooks'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const hierarchyInfo = user ? getRoleHierarchyInfo(user) : null

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <BlockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />

          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You do not have permission to access the Admin Panel.
          </Typography>

          {hierarchyInfo && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Your Current Access:
              </Typography>
              <Typography variant="h6" color="primary">
                {hierarchyInfo.roleNames}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Level {hierarchyInfo.level} - {hierarchyInfo.hierarchyLabel}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              🔒 Admin Panel Access Restricted To:
            </Typography>
            <Typography variant="body2" color="info.dark">
              • <strong>Developer</strong> (Level 0) - daniel@quty.co.id<br />
              • <strong>Superadmin</strong> (Level 1)
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            If you believe this is an error, please contact the system administrator.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  )
}

export default Unauthorized
