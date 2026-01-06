import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, Chip, } from '@mui/material';
import { Search } from '@mui/icons-material';
const mockLogs = [
    { id: 1, timestamp: '2026-01-06 10:30:45', user: 'admin@imsquty.local', action: 'CREATE', resource: 'Asset', resourceId: '123', status: 'success', ipAddress: '192.168.1.100' },
    { id: 2, timestamp: '2026-01-06 09:15:30', user: 'john@imsquty.local', action: 'UPDATE', resource: 'Ticket', resourceId: '456', status: 'success', ipAddress: '192.168.1.101' },
    { id: 3, timestamp: '2026-01-06 08:45:12', user: 'sarah@imsquty.local', action: 'DELETE', resource: 'Document', resourceId: '789', status: 'success', ipAddress: '192.168.1.102' },
    { id: 4, timestamp: '2026-01-05 16:20:00', user: 'admin@imsquty.local', action: 'LOGIN', resource: 'User', resourceId: '1', status: 'success', ipAddress: '192.168.1.100' },
];
const AuditLogsList = () => {
    const [logs, setLogs] = useState(mockLogs);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = logs.filter(log => log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'error';
            case 'LOGIN': return 'primary';
            default: return 'default';
        }
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "h4", children: "Audit Logs" }), _jsx(TextField, { placeholder: "Search by user, resource, or action...", fullWidth: true, variant: "outlined", size: "small", InputProps: { startAdornment: _jsx(Search, { sx: { mr: 1, color: 'gray' } }) }, value: searchQuery, onChange: (e) => { setSearchQuery(e.target.value); setPage(0); } }), _jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("strong", { children: "Timestamp" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "User" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Action" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Resource" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "IP Address" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Status" }) })] }) }), _jsx(TableBody, { children: paginated.length > 0 ? paginated.map(log => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: log.timestamp }), _jsx(TableCell, { children: log.user }), _jsx(TableCell, { children: _jsx(Chip, { label: log.action, color: getActionColor(log.action), size: "small" }) }), _jsxs(TableCell, { children: [log.resource, " #", log.resourceId] }), _jsx(TableCell, { children: log.ipAddress }), _jsx(TableCell, { children: _jsx(Chip, { label: log.status.toUpperCase(), color: "success", size: "small" }) })] }, log.id))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", sx: { py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No logs found" }) }) })) })] }), _jsx(TablePagination, { rowsPerPageOptions: [10, 25, 50], component: "div", count: filtered.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, p) => setPage(p), onRowsPerPageChange: (e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); } })] })] }) }));
};
export default AuditLogsList;
