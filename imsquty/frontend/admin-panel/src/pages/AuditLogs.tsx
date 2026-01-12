import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { AuditLog, ExportFormat } from '../api/auditService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearFilters,
  clearMessages,
  clearSelectedLog,
  exportLogs,
  fetchAuditLogDetail,
  fetchAuditLogs,
  fetchAuditStatistics,
  fetchAvailableActions,
  fetchAvailableModules,
  purgeAuditLogs,
  setFilters,
} from '../store/slices/auditSlice';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get severity color
 */
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};

/**
 * Get severity icon
 */
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <ErrorIcon fontSize="small" />;
    case 'error':
      return <ErrorIcon fontSize="small" />;
    case 'warning':
      return <WarningIcon fontSize="small" />;
    case 'info':
    default:
      return <InfoIcon fontSize="small" />;
  }
};

/**
 * Get status color
 */
const getStatusColor = (status: string) => {
  return status === 'success' ? 'success' : 'error';
};

/**
 * Format date to readable string
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format JSON for display
 */
const formatJSON = (data: Record<string, any> | null | undefined): string => {
  if (!data) return 'N/A';
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return 'Invalid JSON';
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const AuditLogs: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    logs,
    selectedLog,
    pagination,
    filters,
    statistics,
    availableActions,
    availableModules,
    loading,
    loadingDetail,
    exporting,
    loadingStats,
    purging,
    error,
    successMessage,
  } = useAppSelector((state) => state.audit);

  // Local state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(90);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ==========================================
  // LIFECYCLE
  // ==========================================

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchAuditLogs(filters));
    dispatch(fetchAuditStatistics());
    dispatch(fetchAvailableActions());
    dispatch(fetchAvailableModules());
  }, [dispatch]);

  // ==========================================
  // HANDLERS
  // ==========================================

  /**
   * Handle search
   */
  const handleSearch = () => {
    const newFilters = {
      ...filters,
      page: 1,
      search: searchQuery || undefined,
      action: selectedAction || undefined,
      module: selectedModule || undefined,
      severity: selectedSeverity || undefined,
      status: selectedStatus || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchAuditLogs(newFilters));
  };

  /**
   * Handle reset filters
   */
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAction('');
    setSelectedModule('');
    setSelectedSeverity('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    dispatch(clearFilters());
    dispatch(fetchAuditLogs({ page: 1, per_page: 25 }));
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    dispatch(fetchAuditLogs(filters));
    dispatch(fetchAuditStatistics());
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage + 1 };
    dispatch(setFilters(newFilters));
    dispatch(fetchAuditLogs(newFilters));
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newPageSize: number) => {
    const newFilters = { ...filters, per_page: newPageSize, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(fetchAuditLogs(newFilters));
  };

  /**
   * Handle view detail
   */
  const handleViewDetail = (id: number) => {
    dispatch(fetchAuditLogDetail(id));
    setDetailDialogOpen(true);
  };

  /**
   * Handle close detail dialog
   */
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    dispatch(clearSelectedLog());
  };

  /**
   * Handle export
   */
  const handleExport = async (format: ExportFormat) => {
    try {
      await dispatch(exportLogs({ format, filters })).unwrap();
    } catch (error: any) {
      console.error('Export failed:', error);
    }
  };

  /**
   * Handle purge old logs
   */
  const handlePurge = async () => {
    if (window.confirm(`Are you sure you want to delete logs older than ${daysToKeep} days? This action cannot be undone.`)) {
      try {
        await dispatch(purgeAuditLogs(daysToKeep)).unwrap();
        setPurgeDialogOpen(false);
        dispatch(fetchAuditLogs(filters));
        dispatch(fetchAuditStatistics());
      } catch (error: any) {
        console.error('Purge failed:', error);
      }
    }
  };

  /**
   * Handle close snackbar
   */
  const handleCloseSnackbar = () => {
    dispatch(clearMessages());
  };

  // ==========================================
  // DATAGRID COLUMNS
  // ==========================================

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: true,
    },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      width: 180,
      sortable: true,
      renderCell: (params: GridRenderCellParams<AuditLog>) => formatDate(params.row.created_at),
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 150,
      sortable: true,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip label={params.row.action} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'module',
      headerName: 'Module',
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip label={params.row.module} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip
          icon={getSeverityIcon(params.row.severity)}
          label={params.row.severity.toUpperCase()}
          size="small"
          color={getSeverityColor(params.row.severity)}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: true,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip
          label={params.row.status.toUpperCase()}
          size="small"
          color={getStatusColor(params.row.status)}
        />
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
      sortable: false,
    },
    {
      field: 'ip_address',
      headerName: 'IP Address',
      width: 130,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewDetail(params.row.id)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage system activity logs
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Logs
                </Typography>
                <Typography variant="h4">
                  {statistics?.total_logs !== undefined && statistics.total_logs !== null
                    ? statistics.total_logs.toLocaleString()
                    : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Logs Today
                </Typography>
                <Typography variant="h4">
                  {statistics?.today_logs !== undefined && statistics.today_logs !== null
                    ? statistics.today_logs.toLocaleString()
                    : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Logs This Week
                </Typography>
                <Typography variant="h4">
                  {statistics?.week_logs !== undefined && statistics.week_logs !== null
                    ? statistics.week_logs.toLocaleString()
                    : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Logs This Month
                </Typography>
                <Typography variant="h4">
                  {statistics?.month_logs !== undefined && statistics.month_logs !== null
                    ? statistics.month_logs.toLocaleString()
                    : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Query */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by description, user, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Grid>

            {/* Action Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {availableActions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Module Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Module</InputLabel>
                <Select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  label="Module"
                >
                  <MenuItem value="">All Modules</MenuItem>
                  {availableModules.map((module) => (
                    <MenuItem key={module} value={module}>
                      {module}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Severity Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="">All Severities</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date From */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Date To */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Stack>
            </Grid>

            {/* Export Buttons */}
            <Grid item xs={12} md={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('csv')}
                  disabled={exporting || loading}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('excel')}
                  disabled={exporting || loading}
                >
                  Export Excel
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('pdf')}
                  disabled={exporting || loading}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setPurgeDialogOpen(true)}
                  disabled={purging || loading}
                >
                  Purge Old Logs
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={logs}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={pagination.total}
          paginationModel={{
            page: pagination.current_page - 1,
            pageSize: pagination.per_page,
          }}
          onPaginationModelChange={(model) => {
            if (model.page !== pagination.current_page - 1) {
              handlePageChange(model.page);
            }
            if (model.pageSize !== pagination.per_page) {
              handlePageSizeChange(model.pageSize);
            }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Audit Log Detail
          <IconButton
            onClick={handleCloseDetailDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedLog ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Log ID
                </Typography>
                <Typography variant="body1">{selectedLog.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body1">{formatDate(selectedLog.created_at)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">{selectedLog.user_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedLog.user_email}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Action
                </Typography>
                <Chip label={selectedLog.action} size="small" color="primary" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Module
                </Typography>
                <Chip label={selectedLog.module} size="small" color="secondary" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Severity
                </Typography>
                <Chip
                  icon={getSeverityIcon(selectedLog.severity)}
                  label={selectedLog.severity.toUpperCase()}
                  size="small"
                  color={getSeverityColor(selectedLog.severity)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{selectedLog.description}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  IP Address
                </Typography>
                <Typography variant="body1">{selectedLog.ip_address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  User Agent
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                  {selectedLog.user_agent}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Old Data
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}
                  >
                    {formatJSON(selectedLog.old_data)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  New Data
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}
                  >
                    {formatJSON(selectedLog.new_data)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Purge Dialog */}
      <Dialog open={purgeDialogOpen} onClose={() => setPurgeDialogOpen(false)} maxWidth="sm">
        <DialogTitle>Purge Old Audit Logs</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will permanently delete logs older than the specified number of days. This cannot be undone.
          </Alert>
          <TextField
            fullWidth
            type="number"
            label="Days to Keep"
            value={daysToKeep}
            onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 90)}
            helperText="Logs older than this will be deleted"
            InputProps={{ inputProps: { min: 1, max: 365 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurgeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handlePurge}
            disabled={purging}
            startIcon={purging ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Purge Logs
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Loading Indicator */}
      {(exporting || purging) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        >
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default AuditLogs;
