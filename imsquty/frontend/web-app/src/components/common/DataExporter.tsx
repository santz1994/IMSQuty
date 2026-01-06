import { Download as DownloadIcon } from '@mui/icons-material'
import { Button, Menu, MenuItem } from '@mui/material'
import React, { useState } from 'react'

interface ExportData {
  [key: string]: any
}

interface DataExporterProps {
  data: ExportData[]
  filename?: string
  columns?: string[]
}

export const useDataExporter = () => {
  const exportToCSV = (
    data: ExportData[],
    filename: string = 'export.csv',
    columns?: string[]
  ) => {
    if (data.length === 0) return

    const keys = columns || Object.keys(data[0])
    const headers = keys.join(',')
    const rows = data
      .map((item) =>
        keys
          .map((key) => {
            const value = item[key]
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value || ''
          })
          .join(',')
      )
      .join('\n')

    const csv = `${headers}\n${rows}`
    downloadFile(csv, filename, 'text/csv')
  }

  const exportToJSON = (
    data: ExportData[],
    filename: string = 'export.json',
    columns?: string[]
  ) => {
    const keys = columns
      ? data.map((item) =>
        Object.fromEntries(
          Object.entries(item).filter(([key]) => keys.includes(key))
        )
      )
      : data

    const json = JSON.stringify(keys, null, 2)
    downloadFile(json, filename, 'application/json')
  }

  const exportToXLSX = async (
    data: ExportData[],
    filename: string = 'export.xlsx',
    columns?: string[]
  ) => {
    try {
      // xlsx is optional - users can install if needed: npm install xlsx
      // For now, fallback to CSV export
      console.warn('XLSX export requires: npm install xlsx')
      exportToCSV(data, filename.replace('.xlsx', '.csv'), columns)
    } catch (error) {
      console.error('Failed to export to XLSX:', error)
      alert('XLSX export not available. Using CSV instead.')
      exportToCSV(data, filename.replace('.xlsx', '.csv'), columns)
    }
  }

  const downloadFile = (
    content: string,
    filename: string,
    type: string
  ) => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return {
    exportToCSV,
    exportToJSON,
    exportToXLSX,
  }
}

const DataExporter: React.FC<DataExporterProps> = ({
  data,
  filename = `export_${new Date().toISOString().split('T')[0]}`,
  columns,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { exportToCSV, exportToJSON, exportToXLSX } = useDataExporter()

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    switch (format) {
      case 'csv':
        exportToCSV(data, `${filename}.csv`, columns)
        break
      case 'json':
        exportToJSON(data, `${filename}.json`, columns)
        break
      case 'xlsx':
        exportToXLSX(data, `${filename}.xlsx`, columns)
        break
    }
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
        <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
        <MenuItem onClick={() => handleExport('xlsx')}>
          Export as Excel
        </MenuItem>
      </Menu>
    </>
  )
}

export default DataExporter
