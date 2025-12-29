import { Box, Grid, Paper, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAssets } from '../store/slices/assetSlice'
import { fetchTickets } from '../store/slices/ticketSlice'

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { assets, pagination: assetPagination } = useAppSelector(
    (state) => state.asset,
  )
  const { tickets, pagination: ticketPagination } = useAppSelector(
    (state) => state.ticket,
  )

  useEffect(() => {
    dispatch(fetchAssets({ page: 1, perPage: 5 }))
    dispatch(fetchTickets({ page: 1, perPage: 5 }))
  }, [dispatch])

  const StatCard: React.FC<{ title: string; value: number | string }> = ({
    title,
    value,
  }) => (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Paper>
  )

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Assets" value={assetPagination.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Tickets" value={ticketPagination.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Open Requests" value="0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Maintenance" value="0" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Assets
            </Typography>
            {assets.slice(0, 5).map((asset) => (
              <Box key={asset.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2">{asset.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Tag: {asset.asset_tag}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Tickets
            </Typography>
            {tickets.slice(0, 5).map((ticket) => (
              <Box key={ticket.id} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="body2">{ticket.title}</Typography>
                <Typography variant="caption" color="textSecondary">
                  #{ticket.ticket_number}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
