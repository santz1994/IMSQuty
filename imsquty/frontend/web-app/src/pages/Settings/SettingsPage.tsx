import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import ThemeSelector from '../../components/common/ThemeSelector'
import { useAppSelector } from '../../store/hooks'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ paddingTop: '20px' }}>
      {value === index && children}
    </div>
  )
}

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [tabValue, setTabValue] = useState(0)

  const [settings, setSettings] = useState({
    appName: 'IMSQuty',
    appUrl: 'http://localhost:5173',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    language: 'en',
    theme: 'auto',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'Asia/Jakarta',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handlePasswordChange = (key: string, value: string) => {
    setPasswordData({ ...passwordData, [key]: value })
  }

  const handleSaveSettings = () => {
    // TODO: API call to save settings
    // localStorage.setItem('userSettings', JSON.stringify(settings))
    setSuccess('Settings saved successfully!')
    setOpenDialog(false)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleChangePassword = () => {
    setError(null)
    setSuccess(null)

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    // TODO: API call to change password
    // POST /api/v1/users/change-password
    setSuccess('Password changed successfully!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleResetSettings = () => {
    setSettings({
      appName: 'IMSQuty',
      appUrl: 'http://localhost:5173',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      twoFactorAuth: false,
      sessionTimeout: '30',
      language: 'en',
      theme: 'auto',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'Asia/Jakarta',
    })
    setSuccess('Settings reset to default!')
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Settings</Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.first_name} {user?.last_name} ({user?.role})
          </Typography>
        </Box>

        {/* Alerts */}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="General" />
            <Tab label="Notifications" />
            <Tab label="Security" />
            <Tab label="Appearance" />
          </Tabs>
        </Box>

        {/* General Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>

            {/* User Preferences */}
            <Card>
              <CardHeader title="User Preferences" />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleChange('language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="id">Indonesian</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleChange('dateFormat', e.target.value)}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Time Format</InputLabel>
                    <Select
                      value={settings.timeFormat}
                      label="Time Format"
                      onChange={(e) => handleChange('timeFormat', e.target.value)}
                    >
                      <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="Timezone"
                      onChange={(e) => handleChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Jakarta">Asia/Jakarta (UTC+7)</MenuItem>
                      <MenuItem value="America/New_York">America/New_York (UTC-5)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (UTC+0)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title="Notification Preferences" />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="bold">Email Notifications</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Receive notifications via email
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    />
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="bold">SMS Notifications</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Receive notifications via SMS
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    />
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="bold">Push Notifications</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Receive push notifications in browser
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={3}>
            {/* Change Password */}
            <Card>
              <CardHeader title="Change Password" />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    fullWidth
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            edge="end"
                          >
                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    fullWidth
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    helperText="Minimum 8 characters"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    fullWidth
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Change Password
                  </Button>
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
                    <Box>
                      <Typography fontWeight="bold">Two-Factor Authentication</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                    />
                  </Box>
                  <Divider />

                  <TextField
                    label="Session Timeout (minutes)"
                    type="number"
                    fullWidth
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                    helperText="Automatically logout after inactive period"
                    inputProps={{ min: 5, max: 120 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title="Theme Settings" />
              <Divider />
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </Stack>
        </TabPanel>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Save Settings
          </Button>
          <Button variant="outlined" onClick={handleResetSettings}>
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
