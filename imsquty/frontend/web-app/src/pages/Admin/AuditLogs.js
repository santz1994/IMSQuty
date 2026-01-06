import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Delete as DeleteIcon, Download as DownloadIcon, Refresh as RefreshIcon, } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { PaginationControls } from '../../components/PaginationControls';
/**
 * AuditLogs Page
 * Admin-only page for viewing system audit logs
 * Features: Log viewer, filtering, export, pagination
 */
const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Filters
    const [filterAction, setFilterAction] = useState('');
    const [filterEntity, setFilterEntity] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    // Load logs
    useEffect(() => {
        loadLogs();
    }, [page, pageSize, filterAction, filterEntity, filterUser, filterDateFrom, filterDateTo]);
    const loadLogs = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            const params = {
                page,
                per_page: pageSize,
                ...(filterAction && { action: filterAction }),
                ...(filterEntity && { entity_type: filterEntity }),
                ...(filterUser && { user_name: filterUser }),
                ...(filterDateFrom && { date_from: filterDateFrom }),
                ...(filterDateTo && { date_to: filterDateTo }),
            };
            const response = await axios.get('/api/v1/admin/audit-logs', { params });
            if (response.data.success) {
                setLogs(response.data.data.logs || []);
                setTotal(response.data.data.pagination?.total || 0);
            }
        }
        catch (error) {
            setErrorMessage('Failed to load audit logs: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleClearFilters = () => {
        setFilterAction('');
        setFilterEntity('');
        setFilterUser('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setPage(1);
    };
    const handleExport = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/audit-logs/export', {
                params: {
                    action: filterAction || undefined,
                    entity_type: filterEntity || undefined,
                    user_name: filterUser || undefined,
                    date_from: filterDateFrom || undefined,
                    date_to: filterDateTo || undefined,
                },
                responseType: 'blob',
            });
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            setSuccessMessage('Logs exported successfully');
        }
        catch (error) {
            setErrorMessage('Failed to export logs: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleClearOldLogs = async () => {
        if (!window.confirm('Are you sure? This will delete all logs older than 90 days.')) {
            return;
        }
        try {
            setLoading(true);
            const response = await axios.delete('/api/v1/admin/audit-logs/old');
            if (response.data.success) {
                setSuccessMessage(response.data.message);
                await loadLogs();
            }
        }
        catch (error) {
            setErrorMessage('Failed to clear old logs: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE':
                return 'success';
            case 'UPDATE':
                return 'info';
            case 'DELETE':
                return 'error';
            case 'LOGIN':
                return 'primary';
            case 'LOGOUT':
                return 'warning';
            default:
                return 'default';
        }
    };
    if (loading && logs.length === 0)
        return _jsx(CircularProgress, {});
    return (_jsxs(Box, { sx: { py: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { variant: "h4", children: "Audit Logs" }), _jsxs(Stack, { direction: "row", spacing: 1, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: () => loadLogs(), disabled: loading, children: "Refresh" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadIcon, {}), onClick: handleExport, disabled: loading || logs.length === 0, children: "Export" }), _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: handleClearOldLogs, disabled: loading, children: "Clear Old" })] })] }), successMessage && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccessMessage(''), children: successMessage })), errorMessage && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setErrorMessage(''), children: errorMessage })), _jsxs(Paper, { sx: { p: 2, mb: 3 }, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 2, fontWeight: 'bold' }, children: "Filters" }), _jsxs(Stack, { direction: { xs: 'column', md: 'row' }, spacing: 2, children: [_jsx(TextField, { label: "User Name", value: filterUser, onChange: (e) => {
                                    setFilterUser(e.target.value);
                                    setPage(1);
                                }, size: "small", disabled: loading }), _jsxs(TextField, { label: "Action", value: filterAction, onChange: (e) => {
                                    setFilterAction(e.target.value);
                                    setPage(1);
                                }, size: "small", disabled: loading, select: true, children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "CREATE", children: "Create" }), _jsx(MenuItem, { value: "UPDATE", children: "Update" }), _jsx(MenuItem, { value: "DELETE", children: "Delete" }), _jsx(MenuItem, { value: "LOGIN", children: "Login" }), _jsx(MenuItem, { value: "LOGOUT", children: "Logout" })] }), _jsxs(TextField, { label: "Entity Type", value: filterEntity, onChange: (e) => {
                                    setFilterEntity(e.target.value);
                                    setPage(1);
                                }, size: "small", disabled: loading, select: true, children: [_jsx(MenuItem, { value: "", children: "All" }), _jsx(MenuItem, { value: "Asset", children: "Asset" }), _jsx(MenuItem, { value: "Ticket", children: "Ticket" }), _jsx(MenuItem, { value: "User", children: "User" })] }), _jsx(TextField, { label: "Date From", type: "date", value: filterDateFrom, onChange: (e) => {
                                    setFilterDateFrom(e.target.value);
                                    setPage(1);
                                }, size: "small", disabled: loading, InputLabelProps: { shrink: true } }), _jsx(TextField, { label: "Date To", type: "date", value: filterDateTo, onChange: (e) => {
                                    setFilterDateTo(e.target.value);
                                    setPage(1);
                                }, size: "small", disabled: loading, InputLabelProps: { shrink: true } }), _jsx(Button, { variant: "outlined", onClick: handleClearFilters, disabled: loading, sx: { whiteSpace: 'nowrap' }, children: "Clear Filters" })] })] }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Date/Time" }), _jsx(TableCell, { children: "User" }), _jsx(TableCell, { children: "Action" }), _jsx(TableCell, { children: "Entity" }), _jsx(TableCell, { children: "IP Address" }), _jsx(TableCell, { children: "Details" })] }) }), _jsx(TableBody, { children: logs.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", sx: { py: 3 }, children: _jsx(Alert, { severity: "info", sx: { border: 'none' }, children: "No audit logs found" }) }) })) : (logs.map((log) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { fontSize: '0.85rem' }, children: new Date(log.created_at).toLocaleString() }), _jsx(TableCell, { children: log.user_name }), _jsx(TableCell, { children: _jsx(Chip, { label: log.action, size: "small", color: getActionColor(log.action), variant: "outlined" }) }), _jsxs(TableCell, { children: [log.entity_type, " #", log.entity_id] }), _jsx(TableCell, { sx: { fontSize: '0.85rem' }, children: log.ip_address }), _jsx(TableCell, { sx: { fontSize: '0.85rem' }, children: _jsx(Typography, { variant: "caption", component: "div", children: log.old_values && Object.keys(log.old_values).length > 0 && (_jsxs(_Fragment, { children: [_jsx("strong", { children: "Changed:" }), " ", Object.keys(log.old_values).join(', ')] })) }) })] }, log.id)))) })] }) }), _jsx(PaginationControls, { page: page, pageSize: pageSize, total: total, onPageChange: setPage, onPageSizeChange: setPageSize, pageSizes: [5, 10, 25, 50] })] }));
};
export default AuditLogs;
