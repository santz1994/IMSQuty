import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { getErrorMessage } from '../../api/client'
import { dashboardService } from '../../api/dashboardService'
import { useRole } from '../../context/RoleContext'

/**
 * Super-Admin System Dashboard
 * 
 * Features:
 * - Real-time system performance metrics
 * - Service health monitoring
 * - Database statistics
 * - Infrastructure status
 * - Advanced monitoring tools
 */
const SuperAdminDashboard: React.FC = () => {
  const theme = useTheme()
  const { isSuperAdmin } = useRole()
  const [tabIndex, setTabIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStats, setSystemStats] = useState<any>(null)

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSystemStats()

      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchSystemStats, 10000)
      return () => clearInterval(interval)
    }
  }, [isSuperAdmin])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getSystemHealth()
      setSystemStats(response)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Access denied if not super-admin
  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          🔒 Access Denied - Super-Admin privileges required
        </Alert>
      </Box>
    )
  }

  // System Performance Metrics (Mock data for now)
  const performanceData = {
    cpu: { usage: 45, max: 100, status: 'good' },
    memory: { used: 8.2, total: 16, unit: 'GB', status: 'good' },
    disk: { io: 125, unit: 'MB/s', status: 'good' },
    network: { traffic: 45, unit: 'Mbps', status: 'good' },
  }

  // Service Health (Mock data)
  const services = [
    { name: 'Auth Service', status: 'healthy', latency: 200, port: 8000 },
    { name: 'Asset Service', status: 'healthy', latency: 180, port: 8001 },
    { name: 'Ticket Service', status: 'healthy', latency: 150, port: 8002 },
    { name: 'Meeting Room Service', status: 'healthy', latency: 210, port: 8003 },
    { name: 'Inventory Service', status: 'warning', latency: 500, port: 8004 },
    { name: 'Financial Service', status: 'healthy', latency: 170, port: 8005 },
    { name: 'User Service', status: 'healthy', latency: 190, port: 8006 },
    { name: 'Notification Service', status: 'down', latency: 0, port: 8007 },
    { name: 'Reporting Service', status: 'healthy', latency: 220, port: 8008 },
    { name: 'Master Data Service', status: 'healthy', latency: 160, port: 8009 },
  ]

  // Database Stats (Mock data)
  const databaseStats = {
    mysql: {
      connections: 234,
      maxConnections: 500,
      slowQueries: 0.02,
      avgLatency: 12,
    },
    redis: {
      memory: 1.2,
      maxMemory: 4,
      operations: 45000,
      hitRate: 95.8,
    },
    queryPerformance: [
      { time: '00:00', queries: 800, slow: 2 },
      { time: '01:00', queries: 600, slow: 1 },
      { time: '02:00', queries: 500, slow: 0 },
      { time: '03:00', queries: 450, slow: 1 },
      { time: '04:00', queries: 900, slow: 3 },
      { time: '05:00', queries: 1200, slow: 5 },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return theme.palette.success.main
      case 'warning':
        return theme.palette.warning.main
      case 'down':
      case 'critical':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'down':
      case 'critical':
        return '❌'
      default:
        return '⚪'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0e27',
        color: '#e0e0e0',
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff88' }}>
              🔧 Super-Admin System Console
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
              Real-time system monitoring & management
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={{
                color: '#00ff88',
                borderColor: '#00ff88',
                '&:hover': { borderColor: '#00ff88', bgcolor: 'rgba(0,255,136,0.1)' },
              }}
              onClick={fetchSystemStats}
            >
              🔄 Refresh
            </Button>
            <Chip
              label={loading ? 'Updating...' : 'Live'}
              sx={{
                bgcolor: loading ? '#888' : '#00ff88',
                color: '#0a0e27',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { color: '#888' },
          '& .Mui-selected': { color: '#00ff88' },
          '& .MuiTabs-indicator': { bgcolor: '#00ff88' },
        }}
      >
        <Tab label="🖥️ System Performance" />
        <Tab label="🔍 Service Health" />
        <Tab label="🗄️ Database" />
        <Tab label="⚙️ Configuration" />
        <Tab label="🔐 Security" />
      </Tabs>

      {/* Tab Content */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {/* CPU Usage */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                💻 CPU Usage
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {performanceData.cpu.usage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={performanceData.cpu.usage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#0a0e27',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getStatusColor(performanceData.cpu.status),
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                {getStatusIcon(performanceData.cpu.status)} System load: Normal
              </Typography>
            </Paper>
          </Grid>

          {/* Memory Usage */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                🧠 Memory
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {performanceData.memory.used} GB
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(performanceData.memory.used / performanceData.memory.total) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#0a0e27',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getStatusColor(performanceData.memory.status),
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                {getStatusIcon(performanceData.memory.status)} {performanceData.memory.used} / {performanceData.memory.total} GB
              </Typography>
            </Paper>
          </Grid>

          {/* Disk I/O */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                💾 Disk I/O
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {performanceData.disk.io}
              </Typography>
              <Typography variant="body2" sx={{ color: '#00ff88' }}>
                {performanceData.disk.unit}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                {getStatusIcon(performanceData.disk.status)} Read/Write speed
              </Typography>
            </Paper>
          </Grid>

          {/* Network */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                🌐 Network
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {performanceData.network.traffic}
              </Typography>
              <Typography variant="body2" sx={{ color: '#00ff88' }}>
                {performanceData.network.unit}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                {getStatusIcon(performanceData.network.status)} Avg throughput
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                ⚡ Quick Actions
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  🔄 Run Migrations
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  💾 Backup Database
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  🗑️ Clear Cache
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  📊 View Logs
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  🧪 Test API
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#00ff88', color: '#0a0e27' }}>
                  🚀 Deploy Service
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabIndex === 1 && (
        <Grid container spacing={3}>
          {/* Service Health Cards */}
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2, bgcolor: '#1a1e3a', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      Port: {service.port}
                    </Typography>
                  </Box>
                  <Chip
                    label={service.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(service.status),
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <Typography variant="h6" sx={{ mt: 2, color: '#00ff88' }}>
                  {service.latency > 0 ? `${service.latency}ms` : 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Avg response time
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {tabIndex === 2 && (
        <Grid container spacing={3}>
          {/* MySQL Stats */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                🗄️ MySQL Database
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Connections
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {databaseStats.mysql.connections}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    / {databaseStats.mysql.maxConnections} max
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Avg Latency
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {databaseStats.mysql.avgLatency}ms
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Query response
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Slow Queries
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {databaseStats.mysql.slowQueries}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={databaseStats.mysql.slowQueries}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#0a0e27',
                      '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Redis Stats */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                🔴 Redis Cache
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Memory Used
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {databaseStats.redis.memory} GB
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    / {databaseStats.redis.maxMemory} GB max
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Operations/sec
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {(databaseStats.redis.operations / 1000).toFixed(1)}K
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Commands executed
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#888' }}>
                    Cache Hit Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#00ff88' }}>
                    {databaseStats.redis.hitRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={databaseStats.redis.hitRate}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#0a0e27',
                      '& .MuiLinearProgress-bar': { bgcolor: '#00ff88' },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Query Performance Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#1a1e3a', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                📈 Query Performance (Last 6 Hours)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={databaseStats.queryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e4a" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ bgcolor: '#1a1e3a', border: 'none', borderRadius: 8 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke="#00ff88"
                    strokeWidth={2}
                    name="Total Queries"
                  />
                  <Line
                    type="monotone"
                    dataKey="slow"
                    stroke="#ff4444"
                    strokeWidth={2}
                    name="Slow Queries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* More tabs to be implemented */}
    </Box>
  )
}

export default SuperAdminDashboard
