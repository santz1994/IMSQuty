import {
  Build as BuildIcon,
  CachedOutlined as CacheIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  Queue as QueueIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearCache,
  clearFailedJobs,
  clearMessages,
  fetchAllSettings,
  fetchCacheStats,
  fetchQueueStats,
  setActiveCategory,
  testEmailSettings,
  testStorageSettings,
  toggleMaintenanceMode,
  updateSettings,
} from '../store/slices/settingsSlice'

/**
 * SystemSettings Component
 * 
 * Comprehensive system configuration page for admin-panel
 * Features:
 * - Application Settings (name, version, timezone, locale)
 * - Email/SMTP Configuration with test functionality
 * - Storage Settings (MinIO/S3) with connection test
 * - Queue Monitoring (RabbitMQ stats, failed jobs management)
 * - Cache Management (Redis stats, flush operations)
 * - Security Settings (2FA, audit logging, API throttling)
 * - Maintenance Mode toggle
 */
const SystemSettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    settings,
    queueStats,
    cacheStats,
    loading,
    saving,
    testing,
    error,
    successMessage,
    activeCategory,
  } = useAppSelector((state) => state.settings)

  const [localSettings, setLocalSettings] = useState<any>({})
  const [cachePattern, setCachePattern] = useState('')

  // Load settings on mount
  useEffect(() => {
    dispatch(fetchAllSettings())
    dispatch(fetchQueueStats())
    dispatch(fetchCacheStats())

    // Auto-refresh queue and cache stats every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchQueueStats())
      dispatch(fetchCacheStats())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  // Update local settings when Redux settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings[activeCategory])
    }
  }, [settings, activeCategory])

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    dispatch(setActiveCategory(newValue as any))
  }

  // Handle field change
  const handleFieldChange = (field: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle save settings
  const handleSave = async () => {
    await dispatch(
      updateSettings({
        category: activeCategory,
        settings: localSettings,
      })
    )
    // Reload settings from server
    dispatch(fetchAllSettings())
  }

  // Handle test email
  const handleTestEmail = async () => {
    await dispatch(testEmailSettings(localSettings))
  }

  // Handle test storage
  const handleTestStorage = async () => {
    await dispatch(testStorageSettings(localSettings))
  }

  // Handle clear cache
  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear ALL cache? This action cannot be undone.')) {
      await dispatch(clearCache())
      dispatch(fetchCacheStats())
    }
  }

  // Handle clear failed jobs
  const handleClearFailedJobs = async () => {
    if (window.confirm('Are you sure you want to clear all failed queue jobs?')) {
      await dispatch(clearFailedJobs())
      dispatch(fetchQueueStats())
    }
  }

  // Handle toggle maintenance
  const handleToggleMaintenance = async (enabled: boolean) => {
    const message = enabled ? prompt('Enter maintenance message:') || 'System under maintenance' : undefined
    await dispatch(toggleMaintenanceMode({ enabled, message }))
  }

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    dispatch(clearMessages())
  }

  if (loading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          System Settings
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => dispatch(fetchAllSettings())}
            disabled={loading}
          >
            Reload
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeCategory} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Application" value="application" icon={<BuildIcon />} iconPosition="start" />
          <Tab label="Email" value="email" icon={<EmailIcon />} iconPosition="start" />
          <Tab label="Storage" value="storage" icon={<StorageIcon />} iconPosition="start" />
          <Tab label="Queue" value="queue" icon={<QueueIcon />} iconPosition="start" />
          <Tab label="Cache" value="cache" icon={<CacheIcon />} iconPosition="start" />
          <Tab label="Security" value="security" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Maintenance" value="maintenance" icon={<WarningIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {saving && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab Panels */}
      <Box>
        {/* Application Settings */}
        {activeCategory === 'application' && localSettings && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Name"
                value={localSettings.app_name || ''}
                onChange={(e) => handleFieldChange('app_name', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application Version"
                value={localSettings.app_version || ''}
                onChange={(e) => handleFieldChange('app_version', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Application URL"
                value={localSettings.app_url || ''}
                onChange={(e) => handleFieldChange('app_url', e.target.value)}
                disabled={saving}
                helperText="Base URL of the application"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={localSettings.company_name || ''}
                onChange={(e) => handleFieldChange('company_name', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                SelectProps={{ native: true }}
                label="Timezone"
                value={localSettings.app_timezone || 'UTC'}
                onChange={(e) => handleFieldChange('app_timezone', e.target.value)}
                disabled={saving}
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Jakarta">Asia/Jakarta</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                SelectProps={{ native: true }}
                label="Locale"
                value={localSettings.app_locale || 'en'}
                onChange={(e) => handleFieldChange('app_locale', e.target.value)}
                disabled={saving}
              >
                <option value="en">English (en)</option>
                <option value="id">Indonesian (id)</option>
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* Email Settings */}
        {activeCategory === 'email' && localSettings && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<EmailIcon />}>
                Configure SMTP settings for sending emails. Test the connection before saving.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                SelectProps={{ native: true }}
                label="Mail Driver"
                value={localSettings.mail_driver || 'smtp'}
                onChange={(e) => handleFieldChange('mail_driver', e.target.value)}
                disabled={saving}
              >
                <option value="smtp">SMTP</option>
                <option value="sendmail">Sendmail</option>
                <option value="mailgun">Mailgun</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={localSettings.mail_host || ''}
                onChange={(e) => handleFieldChange('mail_host', e.target.value)}
                disabled={saving}
                placeholder="smtp.gmail.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="SMTP Port"
                value={localSettings.mail_port || 587}
                onChange={(e) => handleFieldChange('mail_port', parseInt(e.target.value))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                SelectProps={{ native: true }}
                label="Encryption"
                value={localSettings.mail_encryption || 'tls'}
                onChange={(e) => handleFieldChange('mail_encryption', e.target.value)}
                disabled={saving}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                value={localSettings.mail_username || ''}
                onChange={(e) => handleFieldChange('mail_username', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="SMTP Password"
                value={localSettings.mail_password || ''}
                onChange={(e) => handleFieldChange('mail_password', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Address"
                value={localSettings.mail_from_address || ''}
                onChange={(e) => handleFieldChange('mail_from_address', e.target.value)}
                disabled={saving}
                placeholder="noreply@example.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={localSettings.mail_from_name || ''}
                onChange={(e) => handleFieldChange('mail_from_name', e.target.value)}
                disabled={saving}
                placeholder="IMSQuty System"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={handleTestEmail}
                disabled={testing || saving}
              >
                {testing ? 'Testing...' : 'Test Email Configuration'}
              </Button>
            </Grid>
          </Grid>
        )}

        {/* Storage Settings */}
        {activeCategory === 'storage' && localSettings && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<StorageIcon />}>
                Configure MinIO/S3 storage for file uploads. Test the connection before saving.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MinIO Endpoint"
                value={localSettings.minio_endpoint || ''}
                onChange={(e) => handleFieldChange('minio_endpoint', e.target.value)}
                disabled={saving}
                placeholder="http://localhost:9000"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bucket Name"
                value={localSettings.minio_bucket || ''}
                onChange={(e) => handleFieldChange('minio_bucket', e.target.value)}
                disabled={saving}
                placeholder="imsquty"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Access Key"
                value={localSettings.minio_access_key || ''}
                onChange={(e) => handleFieldChange('minio_access_key', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="password"
                label="Secret Key"
                value={localSettings.minio_secret_key || ''}
                onChange={(e) => handleFieldChange('minio_secret_key', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Region"
                value={localSettings.minio_region || 'us-east-1'}
                onChange={(e) => handleFieldChange('minio_region', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Upload Size (MB)"
                value={localSettings.max_upload_size || 10}
                onChange={(e) => handleFieldChange('max_upload_size', parseInt(e.target.value))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<CloudIcon />}
                onClick={handleTestStorage}
                disabled={testing || saving}
              >
                {testing ? 'Testing...' : 'Test Storage Connection'}
              </Button>
            </Grid>
          </Grid>
        )}

        {/* Queue Settings & Monitoring */}
        {activeCategory === 'queue' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<QueueIcon />}>
                Monitor RabbitMQ queue status and manage failed jobs.
              </Alert>
            </Grid>

            {/* Queue Statistics */}
            {queueStats && (
              <>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Pending Jobs
                        </Typography>
                        <NotificationsIcon color="primary" />
                      </Stack>
                      <Typography variant="h4" mt={1}>
                        {queueStats.pending_jobs}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Failed Jobs
                        </Typography>
                        <ErrorIcon color="error" />
                      </Stack>
                      <Typography variant="h4" mt={1} color="error">
                        {queueStats.failed_jobs}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Processed Jobs
                        </Typography>
                        <CheckCircleIcon color="success" />
                      </Stack>
                      <Typography variant="h4" mt={1}>
                        {queueStats.processed_jobs}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Queue Status
                        </Typography>
                        <Chip
                          label={queueStats.queue_status}
                          color={queueStats.queue_status === 'running' ? 'success' : 'error'}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="h4" mt={1}>
                        {queueStats.workers_active}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active Workers
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Queue Configuration */}
            {localSettings && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="RabbitMQ Host"
                    value={localSettings.rabbitmq_host || ''}
                    onChange={(e) => handleFieldChange('rabbitmq_host', e.target.value)}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="RabbitMQ Port"
                    value={localSettings.rabbitmq_port || 5672}
                    onChange={(e) => handleFieldChange('rabbitmq_port', parseInt(e.target.value))}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="RabbitMQ User"
                    value={localSettings.rabbitmq_user || ''}
                    onChange={(e) => handleFieldChange('rabbitmq_user', e.target.value)}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="RabbitMQ Password"
                    value={localSettings.rabbitmq_password || ''}
                    onChange={(e) => handleFieldChange('rabbitmq_password', e.target.value)}
                    disabled={saving}
                  />
                </Grid>
              </>
            )}

            {/* Queue Actions */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(fetchQueueStats())}
                >
                  Refresh Stats
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearFailedJobs}
                  disabled={!queueStats || queueStats.failed_jobs === 0}
                >
                  Clear Failed Jobs
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Cache Settings & Management */}
        {activeCategory === 'cache' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<CacheIcon />}>
                Monitor Redis cache statistics and perform cache management operations.
              </Alert>
            </Grid>

            {/* Cache Statistics */}
            {cacheStats && (
              <>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Keys
                      </Typography>
                      <Typography variant="h4" mt={1}>
                        {cacheStats.total_keys.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Memory Used
                      </Typography>
                      <Typography variant="h5" mt={1}>
                        {cacheStats.memory_used}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of {cacheStats.memory_limit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Hit Rate
                      </Typography>
                      <Typography variant="h4" mt={1} color="success.main">
                        {cacheStats.hit_rate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Connections
                      </Typography>
                      <Typography variant="h4" mt={1}>
                        {cacheStats.connections}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Cache Configuration */}
            {localSettings && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Redis Host"
                    value={localSettings.redis_host || ''}
                    onChange={(e) => handleFieldChange('redis_host', e.target.value)}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Redis Port"
                    value={localSettings.redis_port || 6379}
                    onChange={(e) => handleFieldChange('redis_port', parseInt(e.target.value))}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Redis Password"
                    value={localSettings.redis_password || ''}
                    onChange={(e) => handleFieldChange('redis_password', e.target.value)}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Redis Database"
                    value={localSettings.redis_database || 0}
                    onChange={(e) => handleFieldChange('redis_database', parseInt(e.target.value))}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cache TTL (seconds)"
                    value={localSettings.cache_ttl || 3600}
                    onChange={(e) => handleFieldChange('cache_ttl', parseInt(e.target.value))}
                    disabled={saving}
                    helperText="Time To Live for cache entries"
                  />
                </Grid>
              </>
            )}

            {/* Cache Actions */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => dispatch(fetchCacheStats())}
                >
                  Refresh Stats
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearCache}
                >
                  Clear All Cache
                </Button>
                <Divider orientation="vertical" flexItem />
                <TextField
                  size="small"
                  label="Cache Key Pattern"
                  value={cachePattern}
                  onChange={(e) => setCachePattern(e.target.value)}
                  placeholder="users:*"
                  sx={{ width: 200 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (cachePattern) {
                      // dispatch(flushCacheByPattern(cachePattern))
                      setCachePattern('')
                    }
                  }}
                  disabled={!cachePattern}
                >
                  Flush Pattern
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Security Settings */}
        {activeCategory === 'security' && localSettings && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" icon={<SecurityIcon />}>
                Security settings affect system-wide authentication and access control.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={localSettings.session_timeout || 30}
                onChange={(e) => handleFieldChange('session_timeout', parseInt(e.target.value))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Login Attempts"
                value={localSettings.max_login_attempts || 5}
                onChange={(e) => handleFieldChange('max_login_attempts', parseInt(e.target.value))}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.enable_2fa || false}
                    onChange={(e) => handleFieldChange('enable_2fa', e.target.checked)}
                    disabled={saving}
                  />
                }
                label="Enable Two-Factor Authentication (2FA)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.enable_audit_logging || false}
                    onChange={(e) => handleFieldChange('enable_audit_logging', e.target.checked)}
                    disabled={saving}
                  />
                }
                label="Enable Audit Logging"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.enable_api_throttling || false}
                    onChange={(e) => handleFieldChange('enable_api_throttling', e.target.checked)}
                    disabled={saving}
                  />
                }
                label="Enable API Rate Limiting"
              />
            </Grid>
            {localSettings.enable_api_throttling && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="API Throttle Rate (requests/minute)"
                  value={localSettings.api_throttle_rate || 60}
                  onChange={(e) => handleFieldChange('api_throttle_rate', parseInt(e.target.value))}
                  disabled={saving}
                />
              </Grid>
            )}
          </Grid>
        )}

        {/* Maintenance Mode */}
        {activeCategory === 'maintenance' && localSettings && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" icon={<WarningIcon />}>
                Maintenance mode will disable access for all users except superadmins.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Maintenance Mode"
                  action={
                    <Switch
                      checked={localSettings.maintenance_mode || false}
                      onChange={(e) => handleToggleMaintenance(e.target.checked)}
                      disabled={saving}
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Status:{' '}
                      <Chip
                        label={localSettings.maintenance_mode ? 'ENABLED' : 'DISABLED'}
                        color={localSettings.maintenance_mode ? 'error' : 'success'}
                        size="small"
                      />
                    </Typography>
                    {localSettings.maintenance_mode && (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Maintenance Message"
                        value={localSettings.maintenance_message || ''}
                        onChange={(e) => handleFieldChange('maintenance_message', e.target.value)}
                        disabled={saving}
                        helperText="This message will be shown to users during maintenance"
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default SystemSettings

