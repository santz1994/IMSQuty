import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'

interface ExportManagerProps {
  data: any[]
  filename?: string
  columns?: string[]
}

const ExportManager: React.FC<ExportManagerProps> = ({
  data,
  filename = 'export',
  columns,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const exportToCSV = () => {
    const headers = columns || Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    handleMenuClose()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    link.click()
    window.URL.revokeObjectURL(url)
    handleMenuClose()
  }

  const exportToExcel = () => {
    // Fallback to CSV export - xlsx not installed
    console.warn('Excel export not available, using CSV instead')
    exportToCSV()
  }

  return (
    <Box>
      <Button
        startIcon={<CloudDownloadIcon />}
        onClick={handleMenuOpen}
        variant="outlined"
        size="small"
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={exportToCSV}>Export to CSV</MenuItem>
        <MenuItem onClick={exportToJSON}>Export to JSON</MenuItem>
        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportManager
