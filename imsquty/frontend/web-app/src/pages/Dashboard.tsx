import { Box, Grid, Paper, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import AISearchBar from '../components/common/AISearchBar'
import PerformanceMetricsDashboard from '../components/common/PerformanceMetricsDashboard'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const assetState = useAppSelector((state) => state.asset)
  const ticketState = useAppSelector((state) => state.ticket)
  const assets = (assetState as any)?.items || (assetState as any)?.data || []
  const tickets = (ticketState as any)?.items || (ticketState as any)?.data || []
  const assetPagination = (assetState as any)?.pagination || { total: 0 }
  const ticketPagination = (ticketState as any)?.pagination || { total: 0 }

  useEffect(() => {
    // TODO: Enable once backend API is properly configured with CORS
    // dispatch(fetchAssets({ page: 1, perPage: 5 }))
    // dispatch(fetchTickets({ page: 1, perPage: 5 }))
  }, [dispatch])

  const StatCard: React.FC<{ title: string; value: number | string }> = ({
    title,
    value,
  }) => (
    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h6" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  )

  const handleSearch = (query: string, suggestion?: any) => {
    console.log('Search:', query, suggestion)
    // TODO: Implement navigation to search results
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        🏠 Dashboard
      </Typography>

      {/* AI-Powered Search Bar */}
      <Box sx={{ mb: 4 }}>
        <AISearchBar onSearch={handleSearch} />
      </Box>

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
    </Box>
  )
}

export default Dashboard
