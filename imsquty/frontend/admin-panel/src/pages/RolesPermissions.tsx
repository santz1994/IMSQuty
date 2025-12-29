import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

const RolesPermissions: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Roles & Permissions
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage system roles and permissions - define access control for users
        </Typography>
      </Paper>
    </Box>
  )
}

export default RolesPermissions
