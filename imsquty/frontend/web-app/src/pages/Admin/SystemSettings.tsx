import { Save as SaveIcon } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FormField, FormGroup } from '../../components/FormField'
import { useAppDispatch } from '../../store/hooks'

interface SystemSettings {
  app_name: string
  app_version: string
  app_url: string
  app_timezone: string
  app_locale: string
  max_upload_size: number
  session_timeout: number
  enable_2fa: boolean
  enable_audit_logging: boolean
  enable_api_throttling: boolean
  api_throttle_rate: number
  backup_enabled: boolean
  backup_frequency: string
  maintenance_mode: boolean
  maintenance_message: string
}

/**
 * SystemSettings Page
 * Admin-only page for system configuration and settings
 * Features: General settings, Security settings, Backup settings, Maintenance mode
 */
const SystemSettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const [settings, setSettings] = useState<SystemSettings>({
    app_name: 'imsquty',
    app_version: '1.0.0',
    app_url: 'http://localhost:3000',
    app_timezone: 'UTC',
    app_locale: 'en-US',
    max_upload_size: 10,
    session_timeout: 30,
    enable_2fa: false,
    enable_audit_logging: true,
    enable_api_throttling: true,
    api_throttle_rate: 60,
    backup_enabled: true,
    backup_frequency: 'daily',
    maintenance_mode: false,
    maintenance_message: '',
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/admin/settings')
      if (response.data.success) {
        setSettings(response.data.data)
      }
    } catch (error: any) {
      setErrorMessage('Failed to load settings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const response = await axios.post('/api/v1/admin/settings', settings)
      if (response.data.success) {
        setSuccessMessage('Settings saved successfully')
        // Reload settings from server
        await loadSettings()
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Settings
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="General Settings" />
            <Divider />
            <CardContent>
              <FormGroup spacing={2}>
                <FormField
                  label="Application Name"
                  value={settings.app_name}
                  onChange={(e) => handleSettingChange('app_name', e.target.value)}
                  disabled={saving}
                />
                <FormField
                  label="Application Version"
                  value={settings.app_version}
                  onChange={(e) => handleSettingChange('app_version', e.target.value)}
                  disabled={saving}
                />
                <FormField
                  label="Application URL"
                  value={settings.app_url}
                  onChange={(e) => handleSettingChange('app_url', e.target.value)}
                  disabled={saving}
                />
                <FormField
                  label="Timezone"
                  value={settings.app_timezone}
                  onChange={(e) => handleSettingChange('app_timezone', e.target.value)}
                  disabled={saving}
                />
                <FormField
                  label="Locale"
                  value={settings.app_locale}
                  onChange={(e) => handleSettingChange('app_locale', e.target.value)}
                  disabled={saving}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Security Settings" />
            <Divider />
            <CardContent>
              <FormGroup spacing={2}>
                <FormField
                  label="Max Upload Size (MB)"
                  type="number"
                  value={settings.max_upload_size}
                  onChange={(e) => handleSettingChange('max_upload_size', Number(e.target.value))}
                  disabled={saving}
                />
                <FormField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleSettingChange('session_timeout', Number(e.target.value))}
                  disabled={saving}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enable_2fa}
                      onChange={(e) => handleSettingChange('enable_2fa', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enable_audit_logging}
                      onChange={(e) => handleSettingChange('enable_audit_logging', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable Audit Logging"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enable_api_throttling}
                      onChange={(e) => handleSettingChange('enable_api_throttling', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable API Throttling"
                />
                {settings.enable_api_throttling && (
                  <FormField
                    label="API Throttle Rate (requests/minute)"
                    type="number"
                    value={settings.api_throttle_rate}
                    onChange={(e) => handleSettingChange('api_throttle_rate', Number(e.target.value))}
                    disabled={saving}
                  />
                )}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Backup Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Backup Settings" />
            <Divider />
            <CardContent>
              <FormGroup spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup_enabled}
                      onChange={(e) => handleSettingChange('backup_enabled', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable Backups"
                />
                {settings.backup_enabled && (
                  <FormField
                    label="Backup Frequency"
                    value={settings.backup_frequency}
                    onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                    disabled={saving}
                    helperText="daily, weekly, or monthly"
                  />
                )}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Mode */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Maintenance Mode" />
            <Divider />
            <CardContent>
              <FormGroup spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenance_mode}
                      onChange={(e) => handleSettingChange('maintenance_mode', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Enable Maintenance Mode"
                />
                {settings.maintenance_mode && (
                  <TextField
                    label="Maintenance Message"
                    value={settings.maintenance_message}
                    onChange={(e) => handleSettingChange('maintenance_message', e.target.value)}
                    disabled={saving}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Message shown to users during maintenance"
                  />
                )}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              variant="outlined"
              onClick={loadSettings}
              disabled={saving}
            >
              Reload
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SystemSettings
