import AssessmentIcon from '@mui/icons-material/Assessment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { getErrorMessage } from '../../api/client'
import { dashboardService } from '../../api/dashboardService'
import { useRole } from '../../context/RoleContext'

/**
 * Director (Direktur) Dashboard
 * 
 * Focus: Strategic business decisions & company-wide KPIs
 * 
 * Features:
 * - Company-wide performance metrics
 * - Financial overview & budget tracking
 * - Department performance comparison
 * - Strategic KPIs & trend analysis
 * - Risk management indicators
 * - High-level reports
 */
const DirectorDashboard: React.FC = () => {
  const theme = useTheme()
  const { isDirector } = useRole()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessMetrics, setBusinessMetrics] = useState<any>(null)
  const [financialData, setFinancialData] = useState<any>(null)
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    if (isDirector) {
      fetchDirectorMetrics()
    }
  }, [isDirector])

  const fetchDirectorMetrics = async () => {
    try {
      setLoading(true)
      const [metrics, financial, departments, trends] = await Promise.all([
        dashboardService.getBusinessMetrics(),
        dashboardService.getFinancialOverview(),
        dashboardService.getDepartmentPerformance(),
        dashboardService.getBusinessTrends()
      ])

      setBusinessMetrics(metrics)
      setFinancialData(financial)
      setDepartmentPerformance(departments)
      setTrendData(trends)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!isDirector) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Akses terbatas untuk Direktur saja</Typography>
      </Box>
    )
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading Director Dashboard...</Box>
  }

  // Mock data for demonstration
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: 'Rp 15.2M',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#d4af37'
    },
    {
      title: 'Total Assets',
      value: '2,847',
      change: '+8.3%',
      trend: 'up',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50'
    },
    {
      title: 'Total Employees',
      value: '347',
      change: '+5.2%',
      trend: 'up',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3'
    },
    {
      title: 'Operational Efficiency',
      value: '87.4%',
      change: '-2.1%',
      trend: 'down',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800'
    }
  ]

  const departmentData = [
    { name: 'IT', performance: 92, budget: 85, satisfaction: 88 },
    { name: 'HR', performance: 88, budget: 90, satisfaction: 85 },
    { name: 'Finance', performance: 95, budget: 88, satisfaction: 90 },
    { name: 'Operations', performance: 85, budget: 82, satisfaction: 80 },
    { name: 'Sales', performance: 90, budget: 87, satisfaction: 92 }
  ]

  const monthlyTrend = [
    { month: 'Jul', revenue: 12.5, costs: 8.2, profit: 4.3 },
    { month: 'Aug', revenue: 13.2, costs: 8.5, profit: 4.7 },
    { month: 'Sep', revenue: 13.8, costs: 8.8, profit: 5.0 },
    { month: 'Oct', revenue: 14.5, costs: 9.0, profit: 5.5 },
    { month: 'Nov', revenue: 14.8, costs: 9.2, profit: 5.6 },
    { month: 'Dec', revenue: 15.2, costs: 9.5, profit: 5.7 }
  ]

  const riskIndicators = [
    { category: 'Financial Risk', level: 'Low', score: 25, color: '#4caf50' },
    { category: 'Operational Risk', level: 'Medium', score: 55, color: '#ff9800' },
    { category: 'Compliance Risk', level: 'Low', score: 30, color: '#4caf50' },
    { category: 'Strategic Risk', level: 'Medium', score: 45, color: '#ff9800' }
  ]

  return (
    <Box sx={{ p: 3, backgroundColor: '#1a1d29', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: '#d4af37', fontWeight: 700 }}>
            👔 Director Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#f5f5f5', mt: 0.5 }}>
            Strategic Business Intelligence & Company-wide Performance
          </Typography>
        </Box>
        <Chip
          label="EXECUTIVE ACCESS"
          sx={{
            backgroundColor: '#d4af37',
            color: '#1a1d29',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}
        />
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: '#2a2d3a', height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ color: '#b0b3c1', mb: 1 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#f5f5f5', fontWeight: 700, mb: 1 }}>
                      {kpi.value}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {kpi.trend === 'up' ? (
                        <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                      ) : (
                        <TrendingDownIcon sx={{ fontSize: 18, color: '#f44336' }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ color: kpi.trend === 'up' ? '#4caf50' : '#f44336' }}
                      >
                        {kpi.change}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ color: kpi.color }}>
                    {kpi.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Analytics Row */}
      <Grid container spacing={3} mb={3}>
        {/* Financial Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#2a2d3a' }}>
            <Typography variant="h6" sx={{ color: '#d4af37', mb: 2, fontWeight: 600 }}>
              📈 Financial Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d4a" />
                <XAxis dataKey="month" stroke="#b0b3c1" />
                <YAxis stroke="#b0b3c1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #3a3d4a' }}
                  labelStyle={{ color: '#f5f5f5' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4af37"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (M)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#4caf50"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  name="Profit (M)"
                />
                <Area
                  type="monotone"
                  dataKey="costs"
                  stroke="#f44336"
                  fill="transparent"
                  name="Costs (M)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Indicators */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: '#2a2d3a', height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#d4af37', mb: 2, fontWeight: 600 }}>
              ⚠️ Risk Management
            </Typography>
            <Stack spacing={2}>
              {riskIndicators.map((risk, idx) => (
                <Box key={idx}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" sx={{ color: '#f5f5f5' }}>
                      {risk.category}
                    </Typography>
                    <Chip
                      label={risk.level}
                      size="small"
                      sx={{
                        backgroundColor: risk.color,
                        color: '#fff',
                        fontSize: '0.75rem',
                        height: '20px'
                      }}
                    />
                  </Stack>
                  <Box sx={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#3a3d4a',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{
                      width: `${risk.score}%`,
                      height: '100%',
                      backgroundColor: risk.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: '#2a2d3a' }}>
            <Typography variant="h6" sx={{ color: '#d4af37', mb: 2, fontWeight: 600 }}>
              🏢 Department Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d4a" />
                <XAxis dataKey="name" stroke="#b0b3c1" />
                <YAxis stroke="#b0b3c1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #3a3d4a' }}
                  labelStyle={{ color: '#f5f5f5' }}
                />
                <Legend />
                <Bar dataKey="performance" fill="#d4af37" name="Performance Score" />
                <Bar dataKey="budget" fill="#4caf50" name="Budget Utilization" />
                <Bar dataKey="satisfaction" fill="#2196f3" name="Satisfaction Score" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DirectorDashboard
