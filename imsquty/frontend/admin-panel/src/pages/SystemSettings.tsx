import { Box, Paper, Typography } from '@mui/material'
import React from 'react'

const SystemSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        System Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          System settings page - configure application settings here
        </Typography>
      </Paper>
    </Box>
  )
}

export default SystemSettings
