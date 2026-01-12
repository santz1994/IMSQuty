import { FileDownload } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import React, { useState } from 'react'
import { useReports } from '../../hooks/useReports'

const ReportsList: React.FC = () => {
  const { reports, loading, error, fetchReports, generateReport, downloadReport } = useReports(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ title: '', type: 'asset', format: 'excel' })

  const handleGenerateReport = async () => {
    await generateReport({
      type: formData.type as any,
      name: formData.title,
      format: formData.format as any
    })
    setOpenDialog(false)
    setFormData({ title: '', type: 'asset', format: 'excel' })
  }

  const handleDownload = async (id: number, name: string) => {
    await downloadReport(id, name)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button onClick={fetchReports}>Retry</Button>}>{error}</Alert></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Reports</Typography>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Generate Report
          </Button>
        </Box>

        <Grid container spacing={2}>
          {reports.map(report => (
            <Grid item xs={12} sm={6} md={4} key={report.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{report.name}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {report.description || 'Generated report'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">{report.created_at?.split(' ')[0]}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption" sx={{ backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                        {report.format.toUpperCase()}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<FileDownload />}
                        onClick={() => handleDownload(report.id, report.name)}
                        disabled={report.status !== 'completed'}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Report Type"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Report Type</option>
                <option value="Asset Inventory Report">Asset Inventory Report</option>
                <option value="Ticket Summary">Ticket Summary</option>
                <option value="Financial Report">Financial Report</option>
                <option value="User Activity">User Activity Report</option>
              </TextField>
              <TextField
                select
                label="Format"
                fullWidth
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </TextField>
              <TextField
                label="Date Range"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={(formData as any).dateRange || ''}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value } as any)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} variant="contained">Generate</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default ReportsList
