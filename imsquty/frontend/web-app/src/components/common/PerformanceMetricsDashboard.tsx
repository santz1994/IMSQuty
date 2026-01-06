import { TrendingDown, TrendingUp } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  trend?: 'up' | 'down' | 'stable'
  trendPercent?: number
  color?: string
}

interface PerformanceMetricsProps {
  onMetricsUpdate?: (metrics: PerformanceMetric[]) => void
}

const PerformanceMetricsDashboard: React.FC<PerformanceMetricsProps> = ({ onMetricsUpdate }) => {
  const theme = useTheme()
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'API Response Time',
      value: 142,
      unit: 'ms',
      trend: 'down',
      trendPercent: 12,
      color: theme.palette.success.main,
    },
    {
      name: 'Page Load Time',
      value: 1.8,
      unit: 's',
      trend: 'up',
      trendPercent: 5,
      color: theme.palette.warning.main,
    },
    {
      name: 'Cache Hit Rate',
      value: 94,
      unit: '%',
      trend: 'stable',
      trendPercent: 0,
      color: theme.palette.info.main,
    },
    {
      name: 'Database Query Time',
      value: 87,
      unit: 'ms',
      trend: 'down',
      trendPercent: 8,
      color: theme.palette.success.main,
    },
  ])

  const [chartData, setChartData] = useState<any[]>([
    { time: '00:00', latency: 145, throughput: 850 },
    { time: '01:00', latency: 138, throughput: 920 },
    { time: '02:00', latency: 142, throughput: 880 },
    { time: '03:00', latency: 135, throughput: 950 },
    { time: '04:00', latency: 141, throughput: 890 },
    { time: '05:00', latency: 139, throughput: 910 },
    { time: '06:00', latency: 142, throughput: 875 },
  ])

  useEffect(() => {
    onMetricsUpdate?.(metrics)
  }, [metrics, onMetricsUpdate])

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * metric.value * 0.05,
        })),
      )

      setChartData((prev) => [
        ...prev.slice(1),
        {
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          latency: 140 + Math.random() * 10,
          throughput: 900 + Math.random() * 50,
        },
      ])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        📊 Real-time Performance Metrics
      </Typography>

      {/* Metrics Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.name}>
            <Card
              sx={{
                backgroundColor: theme.palette.background.paper,
                border: `2px solid ${metric.color}33`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 16px ${metric.color}22`,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {metric.name}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: metric.color,
                        mt: 0.5,
                      }}
                    >
                      {metric.value.toFixed(1)} <span style={{ fontSize: '0.8em' }}>{metric.unit}</span>
                    </Typography>
                  </Box>

                  {metric.trend && metric.trendPercent !== undefined && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        padding: '4px 8px',
                        borderRadius: 1,
                        backgroundColor:
                          metric.trend === 'down' && metric.name !== 'Page Load Time'
                            ? theme.palette.success.light
                            : metric.trend === 'up'
                              ? theme.palette.error.light
                              : theme.palette.grey[200],
                      }}
                    >
                      {metric.trend === 'down' && metric.name !== 'Page Load Time' ? (
                        <TrendingDown sx={{ fontSize: 16, color: theme.palette.success.dark }} />
                      ) : metric.trend === 'up' ? (
                        <TrendingUp sx={{ fontSize: 16, color: theme.palette.error.dark }} />
                      ) : null}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color:
                            metric.trend === 'down' && metric.name !== 'Page Load Time'
                              ? theme.palette.success.dark
                              : metric.trend === 'up'
                                ? theme.palette.error.dark
                                : theme.palette.grey[700],
                        }}
                      >
                        {metric.trendPercent}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min((metric.value / 200) * 100, 100)}
                  sx={{
                    mt: 1.5,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: `${metric.color}22`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: metric.color,
                      borderRadius: 2,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Chart */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          📈 System Performance Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="time"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: 12 }}
            />
            <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke={theme.palette.primary.main}
              dot={false}
              strokeWidth={2}
              isAnimationActive={true}
              name="API Latency (ms)"
            />
            <Line
              type="monotone"
              dataKey="throughput"
              stroke={theme.palette.success.main}
              dot={false}
              strokeWidth={2}
              isAnimationActive={true}
              name="Throughput (req/s)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Health Status */}
      <Paper
        sx={{
          p: 2,
          mt: 2,
          backgroundColor: theme.palette.success.light,
          borderLeft: `4px solid ${theme.palette.success.main}`,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ✅ System Status: <span style={{ color: theme.palette.success.dark }}>All Systems Operational</span>
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Last update: {new Date().toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  )
}

export default PerformanceMetricsDashboard
