/**
 * KPI Dashboard Component
 * Comprehensive Key Performance Indicators dashboard
 * 
 * Features:
 * - Real-time KPI monitoring
 * - Category-based metrics
 * - Visual indicators and charts
 * - Export capabilities
 */

import {
  Assessment,
  AttachMoney,
  Download,
  People,
  Refresh,
  Speed,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { KPIMetric, useKPI } from '../../hooks/useKPI'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const KPIDashboard: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const { kpis, metrics, loading, refreshKPIs, getMetricsByCategory } = useKPI(true)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return theme.palette.success.main
      case 'good': return theme.palette.info.main
      case 'warning': return theme.palette.warning.main
      case 'critical': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const KPICard: React.FC<{ metric: KPIMetric }> = ({ metric }) => {
    const progress = (metric.value / metric.target) * 100
    const isPositive = metric.change >= 0

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {metric.name}
            </Typography>
            <Chip
              label={metric.status}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(metric.status), 0.1),
                color: getStatusColor(metric.status),
              }}
            />
          </Box>

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {metric.value}{metric.unit}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {isPositive ? (
              <TrendingUp fontSize="small" color="success" />
            ) : (
              <TrendingDown fontSize="small" color="error" />
            )}
            <Typography variant="body2" color={isPositive ? 'success.main' : 'error.main'}>
              {isPositive ? '+' : ''}{metric.change}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last period
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress to Target
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(getStatusColor(metric.status), 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStatusColor(metric.status),
                },
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Target: {metric.target}{metric.unit}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Real trend data from API
  const trendData = kpis?.trends || []

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            📊 Key Performance Indicators
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system performance metrics and analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={refreshKPIs}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assessment sx={{ fontSize: 40, color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis?.asset_availability || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Asset Availability
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Speed sx={{ fontSize: 40, color: theme.palette.info.main }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis?.ticket_sla_compliance || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SLA Compliance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis?.budget_utilization || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Budget Utilization
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40, color: theme.palette.error.main }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {kpis?.user_satisfaction_score || 0}/5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Satisfaction
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Metrics" />
          <Tab label="Assets" />
          <Tab label="Tickets" />
          <Tab label="Financial" />
          <Tab label="Operational" />
        </Tabs>

        {/* All Metrics */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {metrics.map(metric => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Assets */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {getMetricsByCategory('asset').map(metric => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Asset Availability Trend" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke={theme.palette.primary?.main || '#1976d2'} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tickets */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {getMetricsByCategory('ticket').map(metric => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Financial */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {getMetricsByCategory('financial').map(metric => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Operational */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            {getMetricsByCategory('operational').map(metric => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <KPICard metric={metric} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  )
}

export default KPIDashboard
