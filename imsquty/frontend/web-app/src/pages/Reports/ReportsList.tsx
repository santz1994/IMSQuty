import { FileDownload } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

const mockReports = [
  { id: 1, title: 'Asset Inventory Report', description: 'Complete asset inventory with status', generatedDate: '2026-01-05', format: 'PDF' },
  { id: 2, title: 'Open Tickets Summary', description: 'All open tickets by priority and assignee', generatedDate: '2026-01-04', format: 'Excel' },
  { id: 3, title: 'Financial Report', description: 'Monthly financial summary and analysis', generatedDate: '2026-01-03', format: 'PDF' },
  { id: 4, title: 'Meeting Rooms Utilization', description: 'Room booking statistics and trends', generatedDate: '2026-01-02', format: 'PDF' },
]

const ReportsList: React.FC = () => {
  const [reports, setReports] = useState(mockReports)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ title: '', format: 'PDF', dateRange: '' })

  const handleGenerateReport = () => {
    const newReport = {
      id: Math.max(...reports.map(r => r.id), 0) + 1,
      title: formData.title,
      description: 'Custom generated report',
      generatedDate: new Date().toISOString().split('T')[0],
      format: formData.format,
    }
    setReports([newReport, ...reports])
    setOpenDialog(false)
  }

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
                  <Typography variant="h6" gutterBottom>{report.title}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{report.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">{report.generatedDate}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption" sx={{ backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }}>
                        {report.format}
                      </Typography>
                      <Button size="small" startIcon={<FileDownload />}>Download</Button>
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
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
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
