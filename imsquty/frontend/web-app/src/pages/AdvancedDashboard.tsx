import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
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
import { useAppSelector } from '../store/hooks'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const AdvancedDashboard: React.FC = () => {
  const { assets } = useAppSelector((state) => state.asset)
  const { tickets } = useAppSelector((state) => state.ticket)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  // Asset status distribution
  const assetStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {}
    assets.forEach((asset) => {
      const status = asset.status || 'unknown'
      statusMap[status] = (statusMap[status] || 0) + 1
    })
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [assets])

  // Ticket trend (simulated by creating bins)
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

  const StatCard: React.FC<{ title: string; value: number; color?: string }> =
    ({ title, value, color = 'primary' }) => (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: `${color}.main`,
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      </Paper>
    )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Advanced Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Assets" value={assets.length} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tickets"
            value={tickets.length}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Resolution"
            value={48}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={98}
            color="primary"
          />
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
    </Box>
  )
}

export default AdvancedDashboard
