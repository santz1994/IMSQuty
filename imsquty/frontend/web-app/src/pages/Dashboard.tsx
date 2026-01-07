import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AISearchBar from '../components/common/AISearchBar'
import AdvancedNotificationSystem from '../components/common/AdvancedNotificationSystem'
import ExportManager from '../components/common/ExportManager'
import PerformanceMetricsDashboard from '../components/common/PerformanceMetricsDashboard'
import SmartSearch from '../components/common/SmartSearch'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const assetState = useAppSelector((state) => state.asset)
  const ticketState = useAppSelector((state) => state.ticket)
  const assets = (assetState as any)?.items || (assetState as any)?.data || []
  const tickets = (ticketState as any)?.items || (ticketState as any)?.data || []
  const assetPagination = (assetState as any)?.pagination || { total: 0 }
  const ticketPagination = (ticketState as any)?.pagination || { total: 0 }

  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    // TODO: Enable once backend API is properly configured with CORS
    // dispatch(fetchAssets({ page: 1, perPage: 5 }))
    // dispatch(fetchTickets({ page: 1, perPage: 5 }))
  }, [dispatch])

  // Asset status distribution
  const assetStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {}
    assets.forEach((asset: any) => {
      const status = asset.status || 'unknown'
      statusMap[status] = (statusMap[status] || 0) + 1
    })
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [assets])

  // Ticket trend
  const ticketTrendData = useMemo(() => {
    const bins = 7
    const data = Array.from({ length: bins }, (_, i) => ({
      day: `Day ${i + 1}`,
      tickets: Math.floor(Math.random() * tickets.length) + 1,
      resolved: Math.floor(Math.random() * tickets.length * 0.7),
    }))
    return data
  }, [tickets])

  // Monthly statistics
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, i) => ({
      month,
      assets: Math.floor(Math.random() * 50) + 20,
      tickets: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 10000) + 5000,
    }))
  }, [])

  const StatCard: React.FC<{ title: string; value: number | string; color?: string }> = ({
    title,
    value,
    color = 'primary',
  }) => (
    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant={color ? 'h5' : 'h4'}
        sx={{
          mt: color ? 0 : 1,
          fontWeight: 700,
          color: color ? `${color}.main` : 'inherit',
        }}
      >
        {value}
      </Typography>
    </Paper>
  )

  const handleSearch = (query: string, suggestion?: any) => {
    console.log('Search:', query, suggestion)
  }

  return (
    <Box>
      <AdvancedNotificationSystem maxNotifications={5} />

      {/* Header with Toggle */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {viewMode === 'basic' ? '🏠 Dashboard' : '📊 Analytics'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'basic' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('basic')}
            size="small"
          >
            Overview
          </Button>
          <Button
            variant={viewMode === 'advanced' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('advanced')}
            size="small"
          >
            Analytics
          </Button>
        </Stack>
      </Stack>

      {/* BASIC VIEW */}
      {viewMode === 'basic' && (
        <>
          {/* Smart Search & AI Search */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <SmartSearch
              onSearch={(query, suggestion) => {
                console.log('Smart Search:', query, suggestion)
                handleSearch(query)
              }}
            />
            <AISearchBar onSearch={handleSearch} />
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Assets" value={assetPagination?.total || 0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Tickets" value={ticketPagination?.total || 0} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Open Requests" value="12" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Maintenance" value="3" />
            </Grid>

            {/* Recent Assets & Tickets */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📦 Recent Assets
                </Typography>
                {assets?.slice(0, 5).map((asset: any) => (
                  <Box key={asset.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {asset.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Tag: {asset.asset_tag}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  🎫 Recent Tickets
                </Typography>
                {tickets?.slice(0, 5).map((ticket: any) => (
                  <Box key={ticket.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      #{ticket.ticket_number}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <PerformanceMetricsDashboard />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* ADVANCED VIEW */}
      {viewMode === 'advanced' && (
        <>
          {/* KPI Cards with Export */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Key Performance Indicators
            </Typography>
            <ExportManager data={assets} filename="assets-report" />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Assets" value={assets.length} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Tickets" value={tickets.length} color="warning" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Avg Resolution" value={48} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="System Health" value={98} color="primary" />
            </Grid>
          </Grid>

          {/* Date Range Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="End Date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button variant="contained">Apply Filter</Button>
              <Button variant="outlined">Reset</Button>
            </Stack>
          </Paper>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Asset Status Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Asset Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Ticket Trend Line Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ticket Trend (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ticketTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      stroke="#8884d8"
                      name="Created"
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#82ca9d"
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Monthly Statistics Bar Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Monthly Statistics
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assets" fill="#8884d8" name="Assets" />
                    <Bar dataKey="tickets" fill="#82ca9d" name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default Dashboard
