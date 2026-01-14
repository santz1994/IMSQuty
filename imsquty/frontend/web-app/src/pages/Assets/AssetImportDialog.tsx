import { CloudUpload, Download } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { useState } from 'react'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportPreview {
  totalRows: number
  successRows: number
  failedRows: number
  errors: Array<{ row: number; error: string }>
  data: Array<any>
}

export default function AssetImportDialog({ open, onClose, onImportComplete }: ImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        setImportError('Please select a valid Excel (.xlsx, .xls) or CSV file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setImportError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setImportError(null)
      setPreview(null)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/assets/import-export/template`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'asset_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Template download failed:', error)
      setImportError('Failed to download template. Please try again.')
    }
  }

  const handlePreview = async () => {
    if (!selectedFile) {
      setImportError('Please select a file first')
      return
    }

    setIsImporting(true)
    setImportError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(`${API_BASE}/api/v1/assets/import-export/import`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        const results = response.data.data
        setPreview({
          totalRows: results.total || 0,
          successRows: results.imported || 0,
          failedRows: results.errors?.length || 0,
          errors: results.errors || [],
          data: results.data || [],
        })
        setStep('results')
        if (results.imported > 0) {
          setImportSuccess(true)
          onImportComplete()
        }
      } else {
        setImportError(response.data.message || 'Import failed')
      }
    } catch (error: any) {
      console.error('Import error:', error)
      setImportError(error.response?.data?.message || 'Import failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setSelectedFile(null)
    setPreview(null)
    setImportError(null)
    setImportSuccess(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CloudUpload />
          <Typography variant="h6">Import Assets</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Upload Step */}
          {step === 'upload' && (
            <>
              <Alert severity="info">
                Select an Excel (.xlsx, .xls) or CSV file to import assets. Maximum file size: 10MB
              </Alert>

              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5',
                  '&:hover': { backgroundColor: '#efefef' },
                }}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <CloudUpload sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    Click to select file or drag and drop
                  </Typography>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ color: 'green', mt: 1 }}>
                      ✓ Selected: {selectedFile.name}
                    </Typography>
                  )}
                </label>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleDownloadTemplate}
                  sx={{ textDecoration: 'none' }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Download sx={{ fontSize: 16 }} />
                    Download Template
                  </Stack>
                </Link>
              </Box>

              {importError && <Alert severity="error">{importError}</Alert>}
            </>
          )}

          {/* Results Step */}
          {step === 'results' && preview && (
            <>
              {importSuccess ? (
                <Alert severity="success">
                  ✓ Import completed successfully! {preview.successRows} assets imported.
                </Alert>
              ) : (
                <Alert severity="warning">
                  Import completed with {preview.failedRows} errors out of {preview.totalRows} rows.
                </Alert>
              )}

              {/* Statistics Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                  <Typography variant="body2" color="textSecondary">
                    Successfully Imported
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'green', fontWeight: 'bold' }}>
                    {preview.successRows}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
                  <Typography variant="body2" color="textSecondary">
                    Failed Rows
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'red', fontWeight: 'bold' }}>
                    {preview.failedRows}
                  </Typography>
                </Paper>
              </Box>

              {/* Error Details */}
              {preview.errors.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fff3e0', maxHeight: 300, overflow: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Error Details:
                  </Typography>
                  {preview.errors.slice(0, 10).map((error, idx) => (
                    <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                      <strong>Row {error.row}:</strong> {error.error}
                    </Typography>
                  ))}
                  {preview.errors.length > 10 && (
                    <Typography variant="caption" sx={{ color: 'orange' }}>
                      ... and {preview.errors.length - 10} more errors
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Imported Preview Table */}
              {preview.data.length > 0 && (
                <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell>Asset Tag</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.data.slice(0, 5).map((asset, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{asset.asset_tag}</TableCell>
                            <TableCell>{asset.name}</TableCell>
                            <TableCell>{asset.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {preview.data.length > 5 && (
                    <Typography variant="caption" sx={{ p: 1, display: 'block', color: '#666' }}>
                      ... and {preview.data.length - 5} more assets
                    </Typography>
                  )}
                </Paper>
              )}

              {importError && <Alert severity="error">{importError}</Alert>}
            </>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Importing assets...</Typography>
              <LinearProgress sx={{ mt: 2 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {step === 'results' ? 'Close' : 'Cancel'}
        </Button>
        {step === 'upload' && (
          <Button
            onClick={handlePreview}
            variant="contained"
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? <CircularProgress size={20} /> : 'Import'}
          </Button>
        )}
        {step === 'results' && (
          <Button onClick={handleReset} variant="contained">
            Import Another File
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
