import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import ThemeSelector from '../../components/common/ThemeSelector'

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: 'IMSQuty',
    appUrl: 'http://localhost:5173',
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    sessionTimeout: '30',
    language: 'en',
  })
  const [openDialog, setOpenDialog] = useState(false)

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSaveSettings = () => {
    // TODO: API call to save settings
    setOpenDialog(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">System Settings</Typography>

        {/* Theme Settings */}
        <ThemeSelector />

        {/* Application Settings */}
        <Card>
          <CardHeader title="Application Settings" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Application Name"
                fullWidth
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
              />
              <TextField
                label="Application URL"
                fullWidth
                value={settings.appUrl}
                onChange={(e) => handleChange('appUrl', e.target.value)}
              />
              <TextField
                select
                label="Language"
                fullWidth
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="en">English</option>
                <option value="id">Indonesian</option>
                <option value="es">Spanish</option>
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader title="Security Settings" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Two-Factor Authentication</Typography>
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                />
              </Box>
              <TextField
                label="Session Timeout (minutes)"
                type="number"
                fullWidth
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader title="Notification Settings" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Email Notifications</Typography>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>SMS Notifications</Typography>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Save Settings
          </Button>
          <Button variant="outlined">
            Reset to Default
          </Button>
        </Box>

        {/* Save Confirmation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Settings</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>Are you sure you want to save these settings? This may require a page reload.</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default SettingsPage
